import { ISlotRepository } from "../../../domain/interfaces/repositories/ISlotRepository";
import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { ITransactionRepository } from "../../../domain/interfaces/repositories/ITransactionRepository";
import { IWalletRepository } from "../../../domain/interfaces/repositories/IWalletRepository";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus";
import { PaymentStatus } from "../../../domain/enums/paymentStatus";
import { TransactionDirection } from "../../../domain/enums/transactionDirection";
import { TransactionType } from "../../../domain/enums/transactionType";
import { TransactionSource } from "../../../domain/enums/transactionSource";
import Appointment from "../../../domain/entities/appointment";
import { IPaymentService } from "../../../domain/interfaces/services/IPaymentService";
import { authModel } from "../../../infrastructure/DB/models/authModel";

export class BookAppointmentUseCase {
  constructor(
    private readonly slotRepository: ISlotRepository,
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly paymentService: IPaymentService,
    private readonly transactionRepository: ITransactionRepository,
    private readonly walletRepository: IWalletRepository,
  ) {}

  async execute(
    slotId: string,
    patientId: string,
    reason: string,
    amount: number,
    currency: string,
    paymentMode: "stripe" | "wallet",
  ): Promise<{ appointment: Appointment; paymentUrl?: string }> {
    const slot = await this.slotRepository.findById(slotId);
    if (!slot) throw new Error("Slot not found");
    const now = new Date();
    if (
      slot.lockedBy !== patientId ||
      !slot.lockedUntil ||
      slot.lockedUntil < now
    ) {
      throw new Error("Slot lock has expired or belongs to someone else.");
    }

    const appointment = await this.appointmentRepository.createAppointment({
      patientId,
      doctorId: slot.doctorId,
      slotId,
      status: AppointmentStatus.PENDING_PAYMENT,
      reason,
    });

    const wallet = await this.walletRepository.findByUserId(patientId);
    if (paymentMode === "wallet") {
      if (!wallet) throw new Error("Wallet not found");
      if (wallet.balance < amount)
        throw new Error("Insufficient wallet balance");

      const adminAuth = await authModel.findOne({ email: "admin@gmail.com" });
      if (!adminAuth) throw new Error("Admin record not found");
      const adminWallet = await this.walletRepository.findByUserId(
        adminAuth._id.toString(),
      );
      if (!adminWallet) throw new Error("Admin wallet not found");

      await this.walletRepository.updateBalance(wallet.id!, -amount);
      await this.walletRepository.updateBalance(adminWallet.id!, amount);

      const patientTransaction =
        await this.transactionRepository.createTransaction({
          direction: TransactionDirection.DEBIT,
          type: TransactionType.APPOINTMENT_PAYMENT,
          source: TransactionSource.WALLET,
          amount,
          currency,
          walletId: wallet.id,
          appointmentId: appointment.id,
          status: PaymentStatus.SUCCESS,
        });

      await this.transactionRepository.createTransaction({
        direction: TransactionDirection.CREDIT,
        type: TransactionType.APPOINTMENT_PAYMENT,
        source: TransactionSource.WALLET,
        amount,
        currency,
        walletId: adminWallet.id,
        appointmentId: appointment.id,
        status: PaymentStatus.SUCCESS,
      });

      await this.appointmentRepository.updatePaymentId(
        appointment.id as string,
        patientTransaction.id as string,
      );

      await this.appointmentRepository.updateStatus(
        appointment.id as string,
        AppointmentStatus.CONFIRMED,
      );
      await this.slotRepository.markSlotAsBooked(
        appointment.slotId,
        appointment.id as string,
      );

      return { appointment };
    }

    // Stripe logic
    const { gatewayRef, paymentUrl } = await this.paymentService.createIntent(
      amount,
      currency,
      { appointmentId: appointment.id },
    );

    const transaction = await this.transactionRepository.createTransaction({
      direction: TransactionDirection.DEBIT,
      type: TransactionType.APPOINTMENT_PAYMENT,
      source: TransactionSource.STRIPE,
      amount,
      currency,
      walletId: wallet?.id || null,
      appointmentId: appointment.id,
      status: PaymentStatus.INITIATED,
      gatewayRef,
    });

    await this.appointmentRepository.updatePaymentId(
      appointment.id as string,
      transaction.id as string,
    );

    return { appointment, paymentUrl };
  }
}
