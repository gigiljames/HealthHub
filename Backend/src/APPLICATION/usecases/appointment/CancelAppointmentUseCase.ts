import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { ISlotRepository } from "../../../domain/interfaces/repositories/ISlotRepository";
import { IWalletRepository } from "../../../domain/interfaces/repositories/IWalletRepository";
import { ITransactionRepository } from "../../../domain/interfaces/repositories/ITransactionRepository";
import { ICancelAppointmentUseCase } from "../../../domain/interfaces/usecases/appointment/ICancelAppointmentUseCase";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus";
import { TransactionDirection } from "../../../domain/enums/transactionDirection";
import { TransactionType } from "../../../domain/enums/transactionType";
import { TransactionSource } from "../../../domain/enums/transactionSource";
import { PaymentStatus } from "../../../domain/enums/paymentStatus";
import { authModel } from "../../../infrastructure/DB/models/authModel";
import { MESSAGES } from "../../../domain/constants/messages";
import { IEmailService } from "../../../domain/interfaces/services/IEmailService";
import { ICreateNotificationUseCase } from "../../../domain/interfaces/usecases/notification/ICreateNotificationUseCase";
import { NotificationType } from "../../../domain/enums/notificationType";
import { Roles } from "../../../domain/enums/roles";
import { logger } from "../../../utils/logger";
import dayjs from "dayjs";

export class CancelAppointmentUseCase implements ICancelAppointmentUseCase {
  constructor(
    private readonly _appointmentRepository: IAppointmentRepository,
    private readonly _slotRepository: ISlotRepository,
    private readonly _walletRepository: IWalletRepository,
    private readonly _transactionRepository: ITransactionRepository,
    private readonly _emailService: IEmailService,
    private readonly _createNotificationUseCase: ICreateNotificationUseCase,
  ) { }

  async execute(appointmentId: string, patientId: string): Promise<void> {
    const appointment =
      await this._appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.APPOINTMENT.NOT_FOUND,
      );
    }

    if (appointment.patientId !== patientId) {
      throw new CustomError(HttpStatusCodes.FORBIDDEN, MESSAGES.ACCESS_DENIED);
    }

    if (appointment.status !== AppointmentStatus.CONFIRMED) {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        "Only confirmed appointments can be cancelled.",
      );
    }

    const slot = await this._slotRepository.findById(appointment.slotId);
    if (!slot) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, MESSAGES.SLOT.NOT_FOUND);
    }

    const appointmentDetails =
      await this._appointmentRepository.getPatientAppointmentById(
        appointmentId,
        patientId,
      );
    if (!appointmentDetails || !appointmentDetails.payment) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.TRANSACTION.NOT_FOUND,
      );
    }

    const patientWallet = await this._walletRepository.findByUserId(patientId);
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
    const adminWallet = await this._walletRepository.findByUserId(
      adminAuth._id.toString(),
    );
    if (!adminWallet) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.WALLET.NOT_FOUND_ADMIN,
      );
    }

    const refundPercentage = this.calculateRefundPercentage(
      new Date(slot.start),
      new Date(),
    );
    const paidAmount = appointmentDetails.payment.amount;
    const currency = appointmentDetails.payment.currency || "INR";
    const refundAmount = (paidAmount * refundPercentage) / 100;

    await this._appointmentRepository.updateStatus(
      appointmentId,
      AppointmentStatus.CANCELLED_BY_USER,
    );
    await this._slotRepository.unlockSlot(appointment.slotId);

    if (refundAmount > 0) {
      // Debit Admin
      await this._walletRepository.updateBalance(
        adminWallet.id as string,
        -refundAmount,
      );
      await this._transactionRepository.createTransaction({
        direction: TransactionDirection.DEBIT,
        type: TransactionType.APPOINTMENT_REFUND,
        source: TransactionSource.WALLET,
        amount: refundAmount,
        currency,
        walletId: adminWallet.id,
        userId: adminAuth._id.toString(),
        appointmentId: appointment.id,
        status: PaymentStatus.SUCCESS,
      });

      // Credit Patient
      await this._walletRepository.updateBalance(
        patientWallet.id as string,
        refundAmount,
      );
      const refundTx = await this._transactionRepository.createTransaction({
        direction: TransactionDirection.CREDIT,
        type: TransactionType.APPOINTMENT_REFUND,
        source: TransactionSource.WALLET,
        amount: refundAmount,
        currency,
        walletId: patientWallet.id,
        userId: patientId,
        appointmentId: appointment.id,
        status: PaymentStatus.SUCCESS,
      });

      if (refundTx && refundTx.id) {
        await this._appointmentRepository.updateRefundTransactionId(appointmentId, refundTx.id);
      }
    }

    try {
      const fullAppt = await this._appointmentRepository.getAdminAppointmentById(appointmentId);
      if (fullAppt) {
        const appointmentTime = dayjs(fullAppt.slot.start).format("DD MMM YYYY, hh:mm A");

        await this._emailService.sendAppointmentCancellationEmail(
          fullAppt.doctorFields.email,
          fullAppt.doctorFields.name,
          appointmentTime,
          "Cancelled by patient"
        );

        await this._createNotificationUseCase.execute({
          userId: fullAppt.patientFields.id,
          role: Roles.USER,
          title: "Appointment Cancelled",
          message: `You have successfully cancelled your appointment with ${fullAppt.doctorFields.name}.`,
          type: NotificationType.APPOINTMENT_CANCELLED,
          referenceId: fullAppt._id
        });

        await this._createNotificationUseCase.execute({
          userId: fullAppt.doctorFields.id,
          role: Roles.DOCTOR,
          title: "Appointment Cancelled",
          message: `${fullAppt.patientFields.name} cancelled the appointment scheduled for ${appointmentTime}.`,
          type: NotificationType.APPOINTMENT_CANCELLED,
          referenceId: fullAppt._id
        });
      }
    } catch (err) {
      logger.error("Failed to send cancellation notifications", err);
    }
  }

  private calculateRefundPercentage(slotStart: Date, now: Date): number {
    const diffMs = slotStart.getTime() - now.getTime();
    const hours = diffMs / (1000 * 60 * 60);

    if (hours > 24) return 100;
    if (hours > 12) return 50;
    if (hours > 6) return 25;
    return 0;
  }
}
