import { IEnforceModerationActionUseCase } from "../../../domain/interfaces/usecases/disputes/IEnforceModerationActionUseCase";
import { EnforceModerationActionDTO } from "../../DTOs/dispute/disputeDTOs";
import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { ISlotRepository } from "../../../domain/interfaces/repositories/ISlotRepository";
import { IWalletRepository } from "../../../domain/interfaces/repositories/IWalletRepository";
import { ITransactionRepository } from "../../../domain/interfaces/repositories/ITransactionRepository";
import { IDoctorProfileRepository } from "../../../domain/interfaces/repositories/IDoctorProfileRepository";
import { IEmailService } from "../../../domain/interfaces/services/IEmailService";
import { ICreateNotificationUseCase } from "../../../domain/interfaces/usecases/notification/ICreateNotificationUseCase";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { authModel } from "../../../infrastructure/DB/models/authModel";
import { appointmentModel } from "../../../infrastructure/DB/models/appointmentModel";
import { transactionModel } from "../../../infrastructure/DB/models/transactionModel";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus";
import { TransactionDirection } from "../../../domain/enums/transactionDirection";
import { TransactionType } from "../../../domain/enums/transactionType";
import { TransactionSource } from "../../../domain/enums/transactionSource";
import { PaymentStatus } from "../../../domain/enums/paymentStatus";
import { Roles } from "../../../domain/enums/roles";
import { NotificationType } from "../../../domain/enums/notificationType";
import { Types } from "mongoose";
import dayjs from "dayjs";

export class EnforceModerationActionUseCase implements IEnforceModerationActionUseCase {
  constructor(
    private readonly _appointmentRepository: IAppointmentRepository,
    private readonly _slotRepository: ISlotRepository,
    private readonly _walletRepository: IWalletRepository,
    private readonly _transactionRepository: ITransactionRepository,
    private readonly _doctorProfileRepository: IDoctorProfileRepository,
    private readonly _emailService: IEmailService,
    private readonly _createNotificationUseCase: ICreateNotificationUseCase,
  ) {}

  async execute(data: EnforceModerationActionDTO): Promise<void> {
    const { targetUserId, actionType, suspensionDays, reason, adminId } = data;

    const targetAuth = await authModel.findById(targetUserId);
    if (!targetAuth) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Target account not found");
    }

    const adminAuth = await authModel.findOne({ email: "admin@gmail.com" });
    if (!adminAuth) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "System admin account not found");
    }

    const adminWallet = await this._walletRepository.findByUserId(adminAuth._id.toString());
    if (!adminWallet) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Admin wallet not found");
    }

    const now = new Date();

    if (actionType === "disable_bookings") {
      // Toggle booking block
      targetAuth.isBookingBlocked = true;
      await targetAuth.save();

      // If doctor, remove from doctor search/listing pages
      if (targetAuth.role === Roles.DOCTOR) {
        const doctorProfile = await this._doctorProfileRepository.findByDoctorId(targetUserId);
        if (doctorProfile) {
          doctorProfile.isVisible = false;
          await this._doctorProfileRepository.save(doctorProfile);
        }
      }

      // Notify the target user
      try {
        await this._emailService.sendBookingDisabledEmail(
          targetAuth.email,
          targetAuth.name,
          targetAuth.role,
          reason,
        );
      } catch (err) {
        console.error("Failed to send booking disabled email", err);
      }
    } else if (actionType === "suspend") {
      if (!suspensionDays || suspensionDays <= 0) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          "A positive number of suspension days must be specified.",
        );
      }

      const suspensionStart = now;
      const suspensionEnd = new Date(now.getTime() + suspensionDays * 24 * 60 * 60 * 1000);

      targetAuth.isBlocked = true;
      targetAuth.suspensionStatus = "suspended";
      targetAuth.suspensionStart = suspensionStart;
      targetAuth.suspensionEnd = suspensionEnd;
      targetAuth.suspensionReason = reason;
      targetAuth.suspendedBy = new Types.ObjectId(adminId);
      await targetAuth.save();

      // If doctor, remove from doctor listing
      if (targetAuth.role === Roles.DOCTOR) {
        const doctorProfile = await this._doctorProfileRepository.findByDoctorId(targetUserId);
        if (doctorProfile) {
          doctorProfile.isVisible = false;
          await this._doctorProfileRepository.save(doctorProfile);
        }
      }

      // Automatically cancel and refund all future appointments
      await this._cancelAndRefundFutureAppointments(
        targetUserId,
        targetAuth.role,
        adminAuth._id.toString(),
        adminWallet.id!,
      );

      // Notify the suspended user
      try {
        await this._emailService.sendAccountSuspendedEmail(
          targetAuth.email,
          targetAuth.name,
          targetAuth.role,
          reason,
          suspensionDays,
          suspensionEnd,
        );
      } catch (err) {
        console.error("Failed to send suspension email", err);
      }
    } else if (actionType === "ban") {
      targetAuth.isBlocked = true;
      targetAuth.suspensionStatus = "banned";
      targetAuth.suspensionStart = now;
      targetAuth.suspensionEnd = null;
      targetAuth.suspensionReason = reason;
      targetAuth.suspendedBy = new Types.ObjectId(adminId);
      await targetAuth.save();

      // If doctor, remove from doctor listing
      if (targetAuth.role === Roles.DOCTOR) {
        const doctorProfile = await this._doctorProfileRepository.findByDoctorId(targetUserId);
        if (doctorProfile) {
          doctorProfile.isVisible = false;
          await this._doctorProfileRepository.save(doctorProfile);
        }
      }

      // Automatically cancel and refund all future appointments
      await this._cancelAndRefundFutureAppointments(
        targetUserId,
        targetAuth.role,
        adminAuth._id.toString(),
        adminWallet.id!,
      );

      // Notify the banned user
      try {
        await this._emailService.sendAccountBannedEmail(
          targetAuth.email,
          targetAuth.name,
          targetAuth.role,
          reason,
        );
      } catch (err) {
        console.error("Failed to send ban email", err);
      }
    } else if (actionType === "restore_access") {
      targetAuth.isBookingBlocked = false;
      await targetAuth.save();

      // If doctor, restore search/listing visibility
      if (targetAuth.role === Roles.DOCTOR) {
        const doctorProfile = await this._doctorProfileRepository.findByDoctorId(targetUserId);
        if (doctorProfile) {
          doctorProfile.isVisible = true;
          await this._doctorProfileRepository.save(doctorProfile);
        }
      }

      // Notify the user via email
      try {
        await this._emailService.sendBookingEnabledEmail(
          targetAuth.email,
          targetAuth.name,
          targetAuth.role,
        );
      } catch (err) {
        console.error("Failed to send booking enabled email", err);
      }

      // Notify the user in-app
      try {
        await this._createNotificationUseCase.execute({
          userId: targetUserId,
          role: targetAuth.role as any,
          title: "Booking Privileges Restored",
          message: "Your booking privileges have been fully restored by the administration.",
          type: NotificationType.SYSTEM,
        });
      } catch (err) {
        console.error("Failed to send booking restored in-app notification", err);
      }
    } else if (actionType === "lift_suspension" || actionType === "lift_ban") {
      targetAuth.isBlocked = false;
      targetAuth.suspensionStatus = "none";
      targetAuth.suspensionStart = null;
      targetAuth.suspensionEnd = null;
      targetAuth.suspensionReason = null;
      targetAuth.suspendedBy = null;
      await targetAuth.save();

      // If doctor, restore search/listing visibility
      if (targetAuth.role === Roles.DOCTOR) {
        const doctorProfile = await this._doctorProfileRepository.findByDoctorId(targetUserId);
        if (doctorProfile) {
          doctorProfile.isVisible = true;
          await this._doctorProfileRepository.save(doctorProfile);
        }
      }

      // Notify the user via email
      try {
        await this._emailService.sendAccountReactivatedEmail(
          targetAuth.email,
          targetAuth.name,
          targetAuth.role,
        );
      } catch (err) {
        console.error("Failed to send account reactivated email", err);
      }

      // Notify the user in-app
      try {
        await this._createNotificationUseCase.execute({
          userId: targetUserId,
          role: targetAuth.role as any,
          title: "Account Status Re-activated",
          message: "Your account restriction status has been fully lifted. You can now use the platform.",
          type: NotificationType.SYSTEM,
        });
      } catch (err) {
        console.error("Failed to send reactivation in-app notification", err);
      }
    } else if (actionType === "restore_all_access") {
      targetAuth.isBlocked = false;
      targetAuth.isBookingBlocked = false;
      targetAuth.suspensionStatus = "none";
      targetAuth.suspensionStart = null;
      targetAuth.suspensionEnd = null;
      targetAuth.suspensionReason = null;
      targetAuth.suspendedBy = null;
      await targetAuth.save();

      // If doctor, restore search/listing visibility
      if (targetAuth.role === Roles.DOCTOR) {
        const doctorProfile = await this._doctorProfileRepository.findByDoctorId(targetUserId);
        if (doctorProfile) {
          doctorProfile.isVisible = true;
          await this._doctorProfileRepository.save(doctorProfile);
        }
      }

      // Notify the user via email
      try {
        await this._emailService.sendAccountReactivatedEmail(
          targetAuth.email,
          targetAuth.name,
          targetAuth.role,
        );
        await this._emailService.sendBookingEnabledEmail(
          targetAuth.email,
          targetAuth.name,
          targetAuth.role,
        );
      } catch (err) {
        console.error("Failed to send restore all access emails", err);
      }

      // Notify the user in-app
      try {
        await this._createNotificationUseCase.execute({
          userId: targetUserId,
          role: targetAuth.role as any,
          title: "Account Fully Restored",
          message: "All restrictions on your account have been fully lifted, and booking privileges have been restored.",
          type: NotificationType.SYSTEM,
        });
      } catch (err) {
        console.error("Failed to send restore all access in-app notification", err);
      }
    }
  }

  private async _cancelAndRefundFutureAppointments(
    targetUserId: string,
    role: Roles,
    adminId: string,
    adminWalletId: string,
  ): Promise<void> {
    const roleKey = role === Roles.DOCTOR ? "doctorId" : "patientId";

    // Query active future appointments
    const appts = await appointmentModel.aggregate([
      {
        $match: {
          [roleKey]: new Types.ObjectId(targetUserId),
          status: AppointmentStatus.CONFIRMED,
        },
      },
      {
        $lookup: {
          from: "slots",
          localField: "slotId",
          foreignField: "_id",
          as: "slot",
        },
      },
      { $unwind: "$slot" },
      {
        $match: {
          "slot.start": { $gte: new Date() },
        },
      },
    ]);

    for (const appt of appts) {
      const apptId = appt._id.toString();
      const slotId = appt.slotId.toString();
      const patientId = appt.patientId.toString();
      const doctorId = appt.doctorId.toString();

      // Cancel the appointment record
      const cancelStatus =
        role === Roles.DOCTOR
          ? AppointmentStatus.CANCELLED_BY_DOCTOR
          : AppointmentStatus.CANCELLED_BY_USER;

      const cancelReason =
        role === Roles.DOCTOR
          ? "Provider unavailability due to account suspension."
          : "Patient account suspended/banned.";

      await this._appointmentRepository.updateStatusAndReason(apptId, cancelStatus, cancelReason);

      // Fetch transaction details to process refund
      let paidAmount = 0;
      let currency = "INR";

      if (appt.paymentId) {
        const tx = await transactionModel.findById(appt.paymentId);
        if (tx && tx.status === PaymentStatus.SUCCESS) {
          paidAmount = tx.amount;
          currency = tx.currency || "INR";
        }
      }

      if (paidAmount > 0) {
        // Refund from Admin Wallet to Patient Wallet
        const patientWallet = await this._walletRepository.findByUserId(patientId);
        if (patientWallet) {
          await this._walletRepository.updateBalance(adminWalletId, -paidAmount);
          await this._transactionRepository.createTransaction({
            direction: TransactionDirection.DEBIT,
            type: TransactionType.APPOINTMENT_REFUND,
            source: TransactionSource.WALLET,
            amount: paidAmount,
            currency,
            walletId: adminWalletId,
            userId: adminId,
            appointmentId: apptId,
            status: PaymentStatus.SUCCESS,
          });

          await this._walletRepository.updateBalance(patientWallet.id!, paidAmount);
          const refundTx = await this._transactionRepository.createTransaction({
            direction: TransactionDirection.CREDIT,
            type: TransactionType.APPOINTMENT_REFUND,
            source: TransactionSource.WALLET,
            amount: paidAmount,
            currency,
            walletId: patientWallet.id!,
            userId: patientId,
            appointmentId: apptId,
            status: PaymentStatus.SUCCESS,
          });

          if (refundTx && refundTx.id) {
            await this._appointmentRepository.updateRefundTransactionId(apptId, refundTx.id);
          }
        }
      }

      // Unlock Doctor Slot
      await this._slotRepository.unlockSlot(slotId);

      // Fetch user/doctor detail names to customize messages
      const patientAuth = await authModel.findById(patientId);
      const doctorAuth = await authModel.findById(doctorId);
      const appointmentTime = dayjs(appt.slot.start).format("MMM DD, YYYY h:mm A");

      // Send Email & App Notifications
      if (role === Roles.DOCTOR) {
        // Notify patient of doctor suspension cancellation
        if (patientAuth) {
          try {
            await this._emailService.sendAppointmentCancellationEmail(
              patientAuth.email,
              patientAuth.name,
              appointmentTime,
              "Provider unavailability due to account suspension.",
            );
          } catch (err) {
            console.error("Failed to send patient cancellation email", err);
          }

          await this._createNotificationUseCase.execute({
            userId: patientId,
            role: Roles.USER,
            title: "Appointment Cancelled",
            message: `Your appointment with Dr. ${doctorAuth?.name || "Doctor"} on ${appointmentTime} has been cancelled due to provider unavailability. A full refund has been initiated.`,
            type: NotificationType.APPOINTMENT_CANCELLED,
            referenceId: apptId,
          });
        }
      } else {
        // Notify doctor of patient suspension cancellation
        if (doctorAuth) {
          await this._createNotificationUseCase.execute({
            userId: doctorId,
            role: Roles.DOCTOR,
            title: "Appointment Cancelled",
            message: `Your appointment with ${patientAuth?.name || "Patient"} on ${appointmentTime} has been cancelled due to patient account suspension.`,
            type: NotificationType.APPOINTMENT_CANCELLED,
            referenceId: apptId,
          });
        }
      }
    }
  }
}
