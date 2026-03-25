import { ITransactionRepository } from "../../../domain/interfaces/repositories/ITransactionRepository";
import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { ISlotRepository } from "../../../domain/interfaces/repositories/ISlotRepository";
import { IWalletRepository } from "../../../domain/interfaces/repositories/IWalletRepository";
import { PaymentStatus } from "../../../domain/enums/paymentStatus";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus";
import { TransactionType } from "../../../domain/enums/transactionType";
import { IConfirmPaymentWebhookUsecase } from "../../../domain/interfaces/usecases/payment/IConfirmPaymentWebhookUsecase";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";

export class ConfirmPaymentWebhookUseCase implements IConfirmPaymentWebhookUsecase {
  constructor(
    private readonly transactionRepository: ITransactionRepository,
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly slotRepository: ISlotRepository,
    private readonly walletRepository: IWalletRepository,
  ) {}

  async execute(gatewayRef: string): Promise<void> {
    const transaction =
      await this.transactionRepository.findByGatewayRef(gatewayRef);
    if (!transaction)
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.TRANSACTION.NOT_FOUND,
      );
    if (transaction.status === PaymentStatus.SUCCESS) return;

    // make this a transaction
    await this.transactionRepository.updateStatus(
      transaction.id as string,
      PaymentStatus.SUCCESS,
    );

    if (transaction.type === TransactionType.WALLET_TOPUP) {
      if (!transaction.walletId)
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.TRANSACTION.MISSING_WALLET_ID,
        );
      await this.walletRepository.updateBalance(
        transaction.walletId,
        transaction.amount,
      );
    } else if (transaction.type === TransactionType.APPOINTMENT_PAYMENT) {
      if (!transaction.appointmentId)
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.TRANSACTION.MISSING_APPOINTMENT_ID,
        );
      const appointment = await this.appointmentRepository.findById(
        transaction.appointmentId,
      );
      if (!appointment)
        throw new CustomError(
          HttpStatusCodes.NOT_FOUND,
          MESSAGES.APPOINTMENT.NOT_FOUND,
        );

      await this.appointmentRepository.updateStatus(
        appointment.id as string,
        AppointmentStatus.CONFIRMED,
      );
      await this.slotRepository.markSlotAsBooked(
        appointment.slotId,
        appointment.id as string,
      );
    }
  }
}
