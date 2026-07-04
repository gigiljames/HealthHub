import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { ISlotRepository } from "../../../domain/interfaces/repositories/ISlotRepository";
import { IRescheduleRequestRepository } from "../../../domain/interfaces/repositories/IRescheduleRequestRepository";
import { IRequestRescheduleUseCase } from "../../../domain/interfaces/usecases/appointment/IRequestRescheduleUseCase";
import { RequestRescheduleDTO } from "../../DTOs/appointment/rescheduleDTOs";
import RescheduleRequest from "../../../domain/entities/rescheduleRequest";
import { RescheduleStatus } from "../../../domain/enums/rescheduleStatus";
import { SlotStatus } from "../../../domain/enums/slotStatus";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";
import { IEmailService } from "../../../domain/interfaces/services/IEmailService";
import { ICreateNotificationUseCase } from "../../../domain/interfaces/usecases/notification/ICreateNotificationUseCase";
import { NotificationType } from "../../../domain/enums/notificationType";
import { Roles } from "../../../domain/enums/roles";
import { authModel } from "../../../infrastructure/DB/models/authModel";
import { IScheduleRuleRepository } from "../../../domain/interfaces/repositories/IScheduleRuleRepository";
import Slot from "../../../domain/entities/slot";
import dayjs from "dayjs";

export class RequestRescheduleUseCase implements IRequestRescheduleUseCase {
  constructor(
    private readonly _appointmentRepository: IAppointmentRepository,
    private readonly _slotRepository: ISlotRepository,
    private readonly _rescheduleRequestRepository: IRescheduleRequestRepository,
    private readonly _emailService: IEmailService,
    private readonly _createNotificationUseCase: ICreateNotificationUseCase,
    private readonly _scheduleRuleRepository: IScheduleRuleRepository,
  ) {}

  async execute(data: RequestRescheduleDTO): Promise<void> {
    const appointment = await this._appointmentRepository.findById(data.appointmentId);
    if (!appointment) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.APPOINTMENT.NOT_FOUND,
      );
    }

    if (appointment.doctorId !== data.doctorId) {
      throw new CustomError(HttpStatusCodes.FORBIDDEN, MESSAGES.ACCESS_DENIED);
    }

    if (appointment.status !== AppointmentStatus.CONFIRMED) {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        "Only confirmed appointments can be rescheduled.",
      );
    }

    const currentSlot = await this._slotRepository.findById(appointment.slotId);
    if (!currentSlot) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, MESSAGES.SLOT.NOT_FOUND);
    }

    const now = new Date();
    if (new Date(currentSlot.start) <= now) {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        "Cannot reschedule an appointment that has already started or passed.",
      );
    }

    // Check reason validation
    if (data.reason === "Other" && (!data.customReason || !data.customReason.trim())) {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        "A custom reason description is required when selecting 'Other'.",
      );
    }

    // Check if there is already a pending reschedule request
    const existingPending = await this._rescheduleRequestRepository.findPendingByAppointmentId(appointment.id!);
    if (existingPending) {
      throw new CustomError(
        HttpStatusCodes.CONFLICT,
        "A reschedule request is already pending for this appointment.",
      );
    }

    // Find or materialize new slot
    let newSlot: Slot | null = null;

    if (data.newSlotId.startsWith("vslot_")) {
      const parts = data.newSlotId.split("_");
      const ruleId = parts[1];
      const startTimeMillis = parseInt(parts[2], 10);
      const startTime = new Date(startTimeMillis);

      if (startTime <= now) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          "Cannot propose a slot in the past.",
        );
      }

      const rule = await this._scheduleRuleRepository.findById(ruleId);
      if (!rule || !rule.id) {
        throw new CustomError(
          HttpStatusCodes.NOT_FOUND,
          "Proposed schedule rule not found.",
        );
      }

      if (rule.doctorId !== data.doctorId) {
        throw new CustomError(HttpStatusCodes.FORBIDDEN, MESSAGES.ACCESS_DENIED);
      }

      const endTime = new Date(startTime.getTime() + rule.duration * 60000);

      // Materialize virtual slot and lock it for patient indefinitely (lockedUntil = start)
      newSlot = await this._slotRepository.materializeAndLockSlot(
        {
          doctorId: rule.doctorId,
          title: rule.title,
          start: startTime,
          end: endTime,
          mode: rule.mode,
          practiceLocationId: rule.practiceLocationId,
          scheduleRuleId: rule.id,
        },
        appointment.patientId,
        startTime // Indefinite lock set to start of slot
      );

      if (!newSlot) {
        throw new CustomError(
          HttpStatusCodes.CONFLICT,
          "Proposed slot is no longer available.",
        );
      }
    } else {
      newSlot = await this._slotRepository.findById(data.newSlotId);
      if (!newSlot) {
        throw new CustomError(
          HttpStatusCodes.NOT_FOUND,
          "Proposed slot not found.",
        );
      }

      if (newSlot.doctorId !== data.doctorId) {
        throw new CustomError(HttpStatusCodes.FORBIDDEN, MESSAGES.ACCESS_DENIED);
      }

      if (newSlot.status !== SlotStatus.AVAILABLE) {
        throw new CustomError(
          HttpStatusCodes.CONFLICT,
          "Proposed slot is no longer available.",
        );
      }

      if (new Date(newSlot.start) <= now) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          "Cannot propose a slot in the past.",
        );
      }

      // Lock new slot indefinitely (lockedUntil = start of slot)
      newSlot.status = SlotStatus.LOCKED;
      newSlot.lockedBy = appointment.patientId;
      newSlot.lockedUntil = newSlot.start;
      await this._slotRepository.save(newSlot);
    }

    // Create Reschedule Request
    const request = new RescheduleRequest({
      appointmentId: appointment.id!,
      oldSlotId: appointment.slotId,
      newSlotId: newSlot.id!, // Save the materialized slot's DB ID
      doctorId: appointment.doctorId,
      patientId: appointment.patientId,
      status: RescheduleStatus.PENDING,
      reason: data.reason,
      customReason: data.reason === "Other" ? data.customReason : null,
    });
    await this._rescheduleRequestRepository.create(request);

    // Update appointment status to RESCHEDULE_PENDING
    await this._appointmentRepository.updateStatus(appointment.id!, AppointmentStatus.RESCHEDULE_PENDING);

    // Notifications
    try {
      const patientAuth = await authModel.findById(appointment.patientId);
      const doctorAuth = await authModel.findById(appointment.doctorId);

      if (patientAuth && doctorAuth) {
        const oldTimeStr = dayjs(currentSlot.start).format("DD MMM YYYY, hh:mm A");
        const newTimeStr = dayjs(newSlot.start).format("DD MMM YYYY, hh:mm A");
        const displayReason = data.reason === "Other" ? data.customReason! : data.reason;

        // Email
        await this._emailService.sendRescheduleRequestEmail(
          patientAuth.email,
          patientAuth.name,
          doctorAuth.name,
          oldTimeStr,
          newTimeStr,
          displayReason,
        );

        // In-App Notification
        await this._createNotificationUseCase.execute({
          userId: patientAuth._id.toString(),
          role: Roles.USER,
          title: "Appointment Reschedule Requested",
          message: `Dr. ${doctorAuth.name} has requested to reschedule your appointment from ${oldTimeStr} to ${newTimeStr}.`,
          type: NotificationType.APPOINTMENT_RESCHEDULE_REQUESTED,
          referenceId: appointment.id!,
        });
      }
    } catch (err) {
      console.error("Failed to send reschedule request notifications:", err);
    }
  }
}
