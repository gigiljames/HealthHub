import { ITransactionRepository } from "../../../domain/interfaces/repositories/ITransactionRepository";
import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { ISlotRepository } from "../../../domain/interfaces/repositories/ISlotRepository";
import { IWalletRepository } from "../../../domain/interfaces/repositories/IWalletRepository";
import { PaymentStatus } from "../../../domain/enums/paymentStatus";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus";
import { TransactionType } from "../../../domain/enums/transactionType";
import { IConfirmPaymentWebhookUsecase } from "../../../domain/interfaces/usecases/payment/IConfirmPaymentWebhookUsecase";
import { IEmailService } from "../../../domain/interfaces/services/IEmailService";
import { ICreateNotificationUseCase } from "../../../domain/interfaces/usecases/notification/ICreateNotificationUseCase";
import { NotificationType } from "../../../domain/enums/notificationType";
import { Roles } from "../../../domain/enums/roles";
import { CustomError } from "../../../domain/entities/customError";
import { logger } from "../../../utils/logger";
import dayjs from "dayjs";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";

export class ConfirmPaymentWebhookUseCase implements IConfirmPaymentWebhookUsecase {
  constructor(
    private readonly _transactionRepository: ITransactionRepository,
    private readonly _appointmentRepository: IAppointmentRepository,
    private readonly _slotRepository: ISlotRepository,
    private readonly _walletRepository: IWalletRepository,
    private readonly _emailService: IEmailService,
    private readonly _createNotificationUseCase: ICreateNotificationUseCase,
  ) { }

  async execute(gatewayRef: string): Promise<void> {
    const transaction =
      await this._transactionRepository.findByGatewayRef(gatewayRef);
    if (!transaction)
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.TRANSACTION.NOT_FOUND,
      );
    if (transaction.status === PaymentStatus.SUCCESS) return;

    // make this a transaction
    await this._transactionRepository.updateStatus(
      transaction.id as string,
      PaymentStatus.SUCCESS,
    );

    if (transaction.type === TransactionType.WALLET_TOPUP) {
      if (!transaction.walletId)
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.TRANSACTION.MISSING_WALLET_ID,
        );
      await this._walletRepository.updateBalance(
        transaction.walletId,
        transaction.amount,
      );
    } else if (transaction.type === TransactionType.APPOINTMENT_PAYMENT) {
      if (!transaction.appointmentId)
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.TRANSACTION.MISSING_APPOINTMENT_ID,
        );
      const appointment = await this._appointmentRepository.findById(
        transaction.appointmentId,
      );
      if (!appointment)
        throw new CustomError(
          HttpStatusCodes.NOT_FOUND,
          MESSAGES.APPOINTMENT.NOT_FOUND,
        );

      await this._appointmentRepository.updateStatus(
        appointment.id as string,
        AppointmentStatus.CONFIRMED,
      );
      await this._slotRepository.markSlotAsBooked(
        appointment.slotId,
        appointment.id as string,
      );

      try {
        const fullAppt = await this._appointmentRepository.getAdminAppointmentById(appointment.id as string);
        if (fullAppt) {
          const appointmentTime = dayjs(fullAppt.slot.start).format("DD MMM YYYY, hh:mm A");

          await this._emailService.sendAppointmentBookedEmail(
            fullAppt.patientFields.email,
            fullAppt.patientFields.name,
            fullAppt.doctorFields.name,
            appointmentTime,
            fullAppt.slot.consultationMode
          );

          await this._createNotificationUseCase.execute({
            userId: fullAppt.patientFields.id,
            role: Roles.USER,
            title: "Appointment Confirmed",
            message: `Your appointment with ${fullAppt.doctorFields.name} on ${appointmentTime} has been confirmed.`,
            type: NotificationType.APPOINTMENT_BOOKED,
            referenceId: fullAppt._id
          });

          await this._createNotificationUseCase.execute({
            userId: fullAppt.doctorFields.id,
            role: Roles.DOCTOR,
            title: "New Appointment",
            message: `You have a new appointment with ${fullAppt.patientFields.name} on ${appointmentTime}.`,
            type: NotificationType.APPOINTMENT_BOOKED,
            referenceId: fullAppt._id
          });
        }
      } catch (err) {
        logger.error("Failed to send booking notifications", err);
      }
    }
  }
}
