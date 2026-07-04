import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { ISlotRepository } from "../../../domain/interfaces/repositories/ISlotRepository";
import { IRescheduleRequestRepository } from "../../../domain/interfaces/repositories/IRescheduleRequestRepository";
import { IWalletRepository } from "../../../domain/interfaces/repositories/IWalletRepository";
import { ITransactionRepository } from "../../../domain/interfaces/repositories/ITransactionRepository";
import { IDeclineRescheduleUseCase } from "../../../domain/interfaces/usecases/appointment/IDeclineRescheduleUseCase";
import { DeclineRescheduleDTO } from "../../DTOs/appointment/rescheduleDTOs";
import { RescheduleStatus } from "../../../domain/enums/rescheduleStatus";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus";
import { TransactionDirection } from "../../../domain/enums/transactionDirection";
import { TransactionType } from "../../../domain/enums/transactionType";
import { TransactionSource } from "../../../domain/enums/transactionSource";
import { PaymentStatus } from "../../../domain/enums/paymentStatus";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";
import { IEmailService } from "../../../domain/interfaces/services/IEmailService";
import { ICreateNotificationUseCase } from "../../../domain/interfaces/usecases/notification/ICreateNotificationUseCase";
import { NotificationType } from "../../../domain/enums/notificationType";
import { Roles } from "../../../domain/enums/roles";
import { authModel } from "../../../infrastructure/DB/models/authModel";

export class DeclineRescheduleUseCase implements IDeclineRescheduleUseCase {
  constructor(
    private readonly _appointmentRepository: IAppointmentRepository,
    private readonly _slotRepository: ISlotRepository,
    private readonly _rescheduleRequestRepository: IRescheduleRequestRepository,
    private readonly _walletRepository: IWalletRepository,
    private readonly _transactionRepository: ITransactionRepository,
    private readonly _emailService: IEmailService,
    private readonly _createNotificationUseCase: ICreateNotificationUseCase,
  ) {}

  async execute(data: DeclineRescheduleDTO): Promise<void> {
    const request = await this._rescheduleRequestRepository.findPendingByAppointmentId(data.appointmentId);
    if (!request) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        "No pending reschedule request found for this appointment.",
      );
    }

    if (request.patientId !== data.patientId) {
      throw new CustomError(HttpStatusCodes.FORBIDDEN, MESSAGES.ACCESS_DENIED);
    }

    if (request.status !== RescheduleStatus.PENDING) {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        "This reschedule request is no longer pending.",
      );
    }

    const appointment = await this._appointmentRepository.findById(data.appointmentId);
    if (!appointment) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.APPOINTMENT.NOT_FOUND,
      );
    }

    const appointmentDetails = await this._appointmentRepository.getPatientAppointmentById(
      data.appointmentId,
      data.patientId,
    );
    if (!appointmentDetails || !appointmentDetails.payment) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.TRANSACTION.NOT_FOUND,
      );
    }

    const patientWallet = await this._walletRepository.findByUserId(data.patientId);
    if (!patientWallet) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.WALLET.NOT_FOUND,
      );
    }

    const adminAuth = await authModel.findOne({ email: "admin@gmail.com" });
    if (!adminAuth) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.ADMIN_DOESNT_EXIST,
      );
    }

    const adminWallet = await this._walletRepository.findByUserId(adminAuth._id.toString());
    if (!adminWallet) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.WALLET.NOT_FOUND_ADMIN,
      );
    }

    const paidAmount = appointmentDetails.payment.amount;
    const currency = "INR";

    // Update reschedule request status to DECLINED
    request.status = RescheduleStatus.DECLINED;
    await this._rescheduleRequestRepository.save(request);

    // Cancel appointment and release old slot
    await this._appointmentRepository.updateStatusAndReason(
      appointment.id!,
      AppointmentStatus.CANCELLED_BY_DOCTOR,
      "Reschedule request declined by patient",
    );

    // Release slots
    await this._slotRepository.unlockSlot(request.oldSlotId);
    await this._slotRepository.unlockSlot(request.newSlotId);

    // Refund
    if (paidAmount > 0) {
      // Debit Admin
      await this._walletRepository.updateBalance(adminWallet.id!, -paidAmount);
      await this._transactionRepository.createTransaction({
        direction: TransactionDirection.DEBIT,
        type: TransactionType.APPOINTMENT_REFUND,
        source: TransactionSource.WALLET,
        amount: paidAmount,
        currency,
        walletId: adminWallet.id,
        userId: adminAuth._id.toString(),
        appointmentId: appointment.id,
        status: PaymentStatus.SUCCESS,
      });

      // Credit Patient
      await this._walletRepository.updateBalance(patientWallet.id!, paidAmount);
      const refundTx = await this._transactionRepository.createTransaction({
        direction: TransactionDirection.CREDIT,
        type: TransactionType.APPOINTMENT_REFUND,
        source: TransactionSource.WALLET,
        amount: paidAmount,
        currency,
        walletId: patientWallet.id,
        userId: data.patientId,
        appointmentId: appointment.id,
        status: PaymentStatus.SUCCESS,
      });

      if (refundTx && refundTx.id) {
        await this._appointmentRepository.updateRefundTransactionId(appointment.id!, refundTx.id);
      }
    }

    // Notifications
    try {
      const patientAuth = await authModel.findById(request.patientId);
      const doctorAuth = await authModel.findById(request.doctorId);

      if (patientAuth && doctorAuth) {
        // Email
        await this._emailService.sendRescheduleDeclinedEmail(
          doctorAuth.email,
          doctorAuth.name,
          patientAuth.name,
        );

        // In-App Notification
        await this._createNotificationUseCase.execute({
          userId: doctorAuth._id.toString(),
          role: Roles.DOCTOR,
          title: "Reschedule Request Declined",
          message: `${patientAuth.name} declined the reschedule request. The appointment has been cancelled and a full refund has been initiated.`,
          type: NotificationType.APPOINTMENT_CANCELLED,
          referenceId: appointment.id!,
        });
      }
    } catch (err) {
      console.error("Failed to send reschedule decline notifications:", err);
    }
  }
}
