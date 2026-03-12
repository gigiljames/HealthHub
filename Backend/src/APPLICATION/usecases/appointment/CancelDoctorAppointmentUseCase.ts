import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { ISlotRepository } from "../../../domain/interfaces/repositories/ISlotRepository";
import { IWalletRepository } from "../../../domain/interfaces/repositories/IWalletRepository";
import { ITransactionRepository } from "../../../domain/interfaces/repositories/ITransactionRepository";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus";
import { TransactionDirection } from "../../../domain/enums/transactionDirection";
import { TransactionType } from "../../../domain/enums/transactionType";
import { TransactionSource } from "../../../domain/enums/transactionSource";
import { PaymentStatus } from "../../../domain/enums/paymentStatus";
import { authModel } from "../../../infrastructure/DB/models/authModel";
import { IEmailService } from "../../../domain/interfaces/services/IEmailService";
import { ICancelDoctorAppointmentUseCase } from "../../../domain/interfaces/usecases/appointment/ICancelDoctorAppointmentUseCase";
import dayjs from "dayjs";

export class CancelDoctorAppointmentUseCase implements ICancelDoctorAppointmentUseCase {
  constructor(
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly slotRepository: ISlotRepository,
    private readonly walletRepository: IWalletRepository,
    private readonly transactionRepository: ITransactionRepository,
    private readonly emailService: IEmailService,
  ) {}

  async execute(
    appointmentId: string,
    doctorId: string,
    reason: string,
  ): Promise<void> {
    const appointment =
      await this.appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Appointment not found");
    }

    if (appointment.doctorId !== doctorId) {
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

    const now = new Date();
    if (new Date(slot.start) <= now) {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        "Cannot cancel an appointment that has already started or passed.",
      );
    }

    const appointmentDetails =
      await this.appointmentRepository.getDoctorAppointmentById(
        appointmentId,
        doctorId,
      );
    if (!appointmentDetails || !appointmentDetails.payment) {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        "Payment details not found for this appointment.",
      );
    }

    const patientWallet = await this.walletRepository.findByUserId(
      appointment.patientId,
    );
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

    const paidAmount = appointmentDetails.payment.amount;
    const currency = appointmentDetails.payment.currency || "INR";

    await this.appointmentRepository.updateStatusAndReason(
      appointmentId,
      AppointmentStatus.CANCELLED_BY_DOCTOR,
      reason,
    );

    await this.slotRepository.unlockSlot(appointment.slotId);

    if (paidAmount > 0) {
      // Debit Admin
      await this.walletRepository.updateBalance(
        adminWallet.id as string,
        -paidAmount,
      );
      await this.transactionRepository.createTransaction({
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
      await this.walletRepository.updateBalance(
        patientWallet.id as string,
        paidAmount,
      );
      await this.transactionRepository.createTransaction({
        direction: TransactionDirection.CREDIT,
        type: TransactionType.APPOINTMENT_REFUND,
        source: TransactionSource.WALLET,
        amount: paidAmount,
        currency,
        walletId: patientWallet.id,
        userId: appointment.patientId,
        appointmentId: appointment.id,
        status: PaymentStatus.SUCCESS,
      });
    }

    const patientAuth = await authModel.findById(appointment.patientId);
    if (patientAuth) {
      this.emailService
        .sendAppointmentCancellationEmail(
          patientAuth.email,
          patientAuth.name,
          dayjs(slot.start).format("MMM D, YYYY h:mm A"),
          reason,
        )
        .catch((err) =>
          console.error("Failed to send cancellation email", err),
        );
    }
  }
}
