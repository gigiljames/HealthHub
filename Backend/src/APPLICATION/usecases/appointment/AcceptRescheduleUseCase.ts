import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { ISlotRepository } from "../../../domain/interfaces/repositories/ISlotRepository";
import { IRescheduleRequestRepository } from "../../../domain/interfaces/repositories/IRescheduleRequestRepository";
import { IAcceptRescheduleUseCase } from "../../../domain/interfaces/usecases/appointment/IAcceptRescheduleUseCase";
import { AcceptRescheduleDTO } from "../../DTOs/appointment/rescheduleDTOs";
import { RescheduleStatus } from "../../../domain/enums/rescheduleStatus";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";
import { IEmailService } from "../../../domain/interfaces/services/IEmailService";
import { ICreateNotificationUseCase } from "../../../domain/interfaces/usecases/notification/ICreateNotificationUseCase";
import { NotificationType } from "../../../domain/enums/notificationType";
import { Roles } from "../../../domain/enums/roles";
import { authModel } from "../../../infrastructure/DB/models/authModel";

export class AcceptRescheduleUseCase implements IAcceptRescheduleUseCase {
  constructor(
    private readonly _appointmentRepository: IAppointmentRepository,
    private readonly _slotRepository: ISlotRepository,
    private readonly _rescheduleRequestRepository: IRescheduleRequestRepository,
    private readonly _emailService: IEmailService,
    private readonly _createNotificationUseCase: ICreateNotificationUseCase,
  ) {}

  async execute(data: AcceptRescheduleDTO): Promise<void> {
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

    // Update reschedule request status to ACCEPTED
    request.status = RescheduleStatus.ACCEPTED;
    await this._rescheduleRequestRepository.save(request);

    // Update appointment slot and status
    await this._appointmentRepository.updateSlotAndStatus(
      appointment.id!,
      request.newSlotId,
      AppointmentStatus.CONFIRMED,
    );

    // Release old slot
    await this._slotRepository.unlockSlot(request.oldSlotId);

    // Mark new slot as booked
    await this._slotRepository.markSlotAsBooked(request.newSlotId, appointment.id!);

    // Notifications
    try {
      const patientAuth = await authModel.findById(request.patientId);
      const doctorAuth = await authModel.findById(request.doctorId);

      if (patientAuth && doctorAuth) {
        // Email
        await this._emailService.sendRescheduleAcceptedEmail(
          doctorAuth.email,
          doctorAuth.name,
          patientAuth.name,
        );

        // In-App Notification
        await this._createNotificationUseCase.execute({
          userId: doctorAuth._id.toString(),
          role: Roles.DOCTOR,
          title: "Appointment Rescheduled",
          message: `${patientAuth.name} accepted your reschedule request.`,
          type: NotificationType.APPOINTMENT_RESCHEDULED,
          referenceId: appointment.id!,
        });
      }
    } catch (err) {
      console.error("Failed to send reschedule accept notifications:", err);
    }
  }
}
