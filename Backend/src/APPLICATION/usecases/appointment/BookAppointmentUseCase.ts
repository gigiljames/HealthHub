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
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";
import { IBookAppointmentUsecase } from "../../../domain/interfaces/usecases/appointment/IBookAppointmentUsecase";

export class BookAppointmentUseCase implements IBookAppointmentUsecase {
  constructor(
    private readonly _slotRepository: ISlotRepository,
    private readonly _appointmentRepository: IAppointmentRepository,
    private readonly _paymentService: IPaymentService,
    private readonly _transactionRepository: ITransactionRepository,
    private readonly _walletRepository: IWalletRepository,
  ) {}

  async execute(
    slotId: string,
    patientId: string,
    reason: string,
    amount: number,
    currency: string,
    paymentMode: "stripe" | "wallet",
  ): Promise<{ appointment: Appointment; paymentUrl?: string }> {
    const slot = await this._slotRepository.findById(slotId);
    if (!slot)
      throw new CustomError(HttpStatusCodes.NOT_FOUND, MESSAGES.SLOT.NOT_FOUND);
    const now = new Date();
    if (
      slot.lockedBy !== patientId ||
      !slot.lockedUntil ||
      slot.lockedUntil < now
    ) {
      throw new CustomError(
        HttpStatusCodes.CONFLICT,
        MESSAGES.SLOT.LOCK_EXPIRED,
      );
    }

    const appointment = await this._appointmentRepository.createAppointment({
      patientId,
      doctorId: slot.doctorId,
      slotId,
      status: AppointmentStatus.PENDING_PAYMENT,
      reason,
    });

    const wallet = await this._walletRepository.findByUserId(patientId);
    if (paymentMode === "wallet") {
      if (!wallet)
        throw new CustomError(
          HttpStatusCodes.NOT_FOUND,
          MESSAGES.WALLET.NOT_FOUND,
        );
      if (wallet.balance < amount)
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.WALLET.INSUFFICIENT_BALANCE,
        );

      const adminAuth = await authModel.findOne({ email: "admin@gmail.com" });
      if (!adminAuth)
        throw new CustomError(HttpStatusCodes.NOT_FOUND, "Admin not found");
      const adminWallet = await this._walletRepository.findByUserId(
        adminAuth._id.toString(),
      );
      if (!adminWallet)
        throw new CustomError(
          HttpStatusCodes.NOT_FOUND,
          MESSAGES.WALLET.NOT_FOUND_ADMIN,
        );

      await this._walletRepository.updateBalance(wallet.id!, -amount);
      await this._walletRepository.updateBalance(adminWallet.id!, amount);

      const patientTransaction =
        await this._transactionRepository.createTransaction({
          direction: TransactionDirection.DEBIT,
          type: TransactionType.APPOINTMENT_PAYMENT,
          source: TransactionSource.WALLET,
          amount,
          currency,
          walletId: wallet.id,
          userId: patientId,
          appointmentId: appointment.id,
          status: PaymentStatus.SUCCESS,
        });

      await this._transactionRepository.createTransaction({
        direction: TransactionDirection.CREDIT,
        type: TransactionType.APPOINTMENT_PAYMENT,
        source: TransactionSource.WALLET,
        amount,
        currency,
        walletId: adminWallet.id,
        userId: adminAuth._id.toString(),
        appointmentId: appointment.id,
        status: PaymentStatus.SUCCESS,
      });

      await this._appointmentRepository.updatePaymentId(
        appointment.id as string,
        patientTransaction.id as string,
      );

      await this._appointmentRepository.updateStatus(
        appointment.id as string,
        AppointmentStatus.CONFIRMED,
      );
      await this._slotRepository.markSlotAsBooked(
        appointment.slotId,
        appointment.id as string,
      );

      return { appointment };
    }

    const { gatewayRef, paymentUrl } = await this._paymentService.createIntent(
      amount,
      currency,
      { appointmentId: appointment.id },
    );

    const transaction = await this._transactionRepository.createTransaction({
      direction: TransactionDirection.DEBIT,
      type: TransactionType.APPOINTMENT_PAYMENT,
      source: TransactionSource.STRIPE,
      amount,
      currency,
      walletId: wallet?.id || null,
      userId: patientId,
      appointmentId: appointment.id,
      status: PaymentStatus.INITIATED,
      gatewayRef,
    });

    await this._appointmentRepository.updatePaymentId(
      appointment.id as string,
      transaction.id as string,
    );

    return { appointment, paymentUrl };
  }
}
