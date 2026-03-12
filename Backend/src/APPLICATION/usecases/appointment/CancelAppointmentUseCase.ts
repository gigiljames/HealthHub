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

export class CancelAppointmentUseCase implements ICancelAppointmentUseCase {
  constructor(
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly slotRepository: ISlotRepository,
    private readonly walletRepository: IWalletRepository,
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(appointmentId: string, patientId: string): Promise<void> {
    const appointment =
      await this.appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Appointment not found");
    }

    if (appointment.patientId !== patientId) {
      throw new CustomError(HttpStatusCodes.FORBIDDEN, "Access denied");
    }

    if (appointment.status !== AppointmentStatus.CONFIRMED) {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        "Only confirmed appointments can be cancelled.",
      );
    }

    const slot = await this.slotRepository.findById(appointment.slotId);
    if (!slot) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        "Slot details not found",
      );
    }

    const appointmentDetails =
      await this.appointmentRepository.getPatientAppointmentById(
        appointmentId,
        patientId,
      );
    if (!appointmentDetails || !appointmentDetails.payment) {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        "Payment details not found for this appointment.",
      );
    }

    const patientWallet = await this.walletRepository.findByUserId(patientId);
    if (!patientWallet) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        "Patient wallet not found",
      );
    }

    const adminAuth = await authModel.findOne({ email: "admin@gmail.com" });
    if (!adminAuth) {
      throw new CustomError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        "Admin record not found",
      );
    }
    const adminWallet = await this.walletRepository.findByUserId(
      adminAuth._id.toString(),
    );
    if (!adminWallet) {
      throw new CustomError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        "Admin wallet not found",
      );
    }

    const refundPercentage = this.calculateRefundPercentage(
      new Date(slot.start),
      new Date(),
    );
    const paidAmount = appointmentDetails.payment.amount;
    const currency = appointmentDetails.payment.currency || "INR";
    const refundAmount = (paidAmount * refundPercentage) / 100;

    await this.appointmentRepository.updateStatus(
      appointmentId,
      AppointmentStatus.CANCELLED_BY_USER,
    );
    await this.slotRepository.unlockSlot(appointment.slotId);

    if (refundAmount > 0) {
      // Debit Admin
      await this.walletRepository.updateBalance(
        adminWallet.id as string,
        -refundAmount,
      );
      await this.transactionRepository.createTransaction({
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
      await this.walletRepository.updateBalance(
        patientWallet.id as string,
        refundAmount,
      );
      await this.transactionRepository.createTransaction({
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
