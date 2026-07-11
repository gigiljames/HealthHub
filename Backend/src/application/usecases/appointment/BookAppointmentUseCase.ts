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
import { IEmailService } from "../../../domain/interfaces/services/IEmailService";
import { ICreateNotificationUseCase } from "../../../domain/interfaces/usecases/notification/ICreateNotificationUseCase";
import { NotificationType } from "../../../domain/enums/notificationType";
import { Roles } from "../../../domain/enums/roles";
import { IDoctorProfileRepository } from "../../../domain/interfaces/repositories/IDoctorProfileRepository";
import { env } from "../../../config/envConfig";
import { logger } from "../../../utils/logger";
import dayjs from "dayjs";
import { PopulatedPracticeLocation } from "../../../domain/types/populatedPracticeLocation";

export class BookAppointmentUseCase implements IBookAppointmentUsecase {
  constructor(
    private readonly _slotRepository: ISlotRepository,
    private readonly _appointmentRepository: IAppointmentRepository,
    private readonly _paymentService: IPaymentService,
    private readonly _transactionRepository: ITransactionRepository,
    private readonly _walletRepository: IWalletRepository,
    private readonly _emailService: IEmailService,
    private readonly _createNotificationUseCase: ICreateNotificationUseCase,
    private readonly _doctorProfileRepository: IDoctorProfileRepository,
  ) { }

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

    // Validate patient booking permissions
    const patientAuth = await authModel.findById(patientId);
    if (!patientAuth) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Patient account not found");
    }
    if (patientAuth.isBlocked) {
      throw new CustomError(HttpStatusCodes.FORBIDDEN, "Your account is currently suspended or banned.");
    }
    if (patientAuth.isBookingBlocked) {
      throw new CustomError(HttpStatusCodes.FORBIDDEN, "Your booking privileges are disabled.");
    }

    // Validate doctor booking permissions
    const doctorAuth = await authModel.findById(slot.doctorId);
    if (!doctorAuth) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Doctor account not found");
    }
    if (doctorAuth.isBlocked) {
      throw new CustomError(HttpStatusCodes.FORBIDDEN, "This doctor is currently unavailable.");
    }
    if (doctorAuth.isBookingBlocked) {
      throw new CustomError(HttpStatusCodes.FORBIDDEN, "This doctor is currently not accepting new bookings.");
    }

    const now = new Date();
    if (slot.start < now) {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        MESSAGES.SLOT.CANNOT_BOOK_PAST_SLOT,
      );
    }
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

    const existingAppointment =
      await this._appointmentRepository.findActiveAppointmentBySlotId(slotId);
    if (existingAppointment) {
      throw new CustomError(
        HttpStatusCodes.CONFLICT,
        "This slot has already been booked. Please select a different slot.",
      );
    }

    const doctorProfile = await this._doctorProfileRepository.findByDoctorIdPopulated(slot.doctorId);
    if (!doctorProfile) {
      throw new CustomError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        MESSAGES.DOCTOR.PROFILE_NOT_FOUND,
      );
    }

    const locationId = slot.practiceLocationId;
    const practiceLocation = doctorProfile.practiceLocations.find(
      (loc: PopulatedPracticeLocation) => loc._id?.toString() === locationId.toString(),
    );

    if (!practiceLocation) {
      throw new CustomError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        MESSAGES.DOCTOR.PRACTICE_LOCATION_NOT_FOUND,
      );
    }

    const consultationFee = practiceLocation.consultationFee;
    const platformFee = env.FIXED_PLATFORM_FEE;
    const expectedAmount = consultationFee + platformFee;

    if (amount !== expectedAmount) {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        "Invalid payment amount.",
      );
    }

    const appointment = await this._appointmentRepository.createAppointment({
      patientId,
      doctorId: slot.doctorId,
      slotId,
      status: AppointmentStatus.PENDING_PAYMENT,
      reason,
      platformFee,
      consultationFee,
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

      return { appointment };
    }

    const { gatewayRef, paymentUrl } = await this._paymentService.createIntent(
      amount,
      currency,
      { appointmentId: appointment.id! },
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
