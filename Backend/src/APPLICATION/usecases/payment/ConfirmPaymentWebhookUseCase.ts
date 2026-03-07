import { ITransactionRepository } from "../../../domain/interfaces/repositories/ITransactionRepository";
import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { ISlotRepository } from "../../../domain/interfaces/repositories/ISlotRepository";
import { IWalletRepository } from "../../../domain/interfaces/repositories/IWalletRepository";
import { PaymentStatus } from "../../../domain/enums/paymentStatus";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus";
import { TransactionType } from "../../../domain/enums/transactionType";

export class ConfirmPaymentWebhookUseCase {
  constructor(
    private readonly transactionRepository: ITransactionRepository,
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly slotRepository: ISlotRepository,
    private readonly walletRepository: IWalletRepository,
  ) {}

  async execute(gatewayRef: string): Promise<void> {
    const transaction =
      await this.transactionRepository.findByGatewayRef(gatewayRef);
    if (!transaction) throw new Error("Transaction record not found");
    if (transaction.status === PaymentStatus.SUCCESS) return;

    // make this a transaction visually
    await this.transactionRepository.updateStatus(
      transaction.id as string,
      PaymentStatus.SUCCESS,
    );

    if (transaction.type === TransactionType.WALLET_TOPUP) {
      if (!transaction.walletId)
        throw new Error("Wallet Id missing in transaction");
      await this.walletRepository.updateBalance(
        transaction.walletId,
        transaction.amount,
      );
    } else if (transaction.type === TransactionType.APPOINTMENT_PAYMENT) {
      const appointment = await this.appointmentRepository.findById(
        transaction.appointmentId as string,
      );
      if (!appointment) throw new Error("Appointment not found");

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
