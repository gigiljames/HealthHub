import { FilterQuery, UpdateQuery } from "mongoose";
import { MESSAGES } from "../../../domain/constants/messages";
import { Consultation } from "../../../domain/entities/consultation";
import { CustomError } from "../../../domain/entities/customError";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { IConsultationRepository } from "../../../domain/interfaces/repositories/IConsultationRepository";
import { ISocketService } from "../../../domain/interfaces/services/ISocketService";
import { IJoinConsultationUseCase } from "../../../domain/interfaces/usecases/consultation/IJoinConsultationUseCase";
import { IConsultationDocument } from "../../../infrastructure/DB/models/consultationModel";

export class JoinConsultationUseCase implements IJoinConsultationUseCase {
  constructor(
    private readonly _consultationRepository: IConsultationRepository,
    private readonly _appointmentRepository: IAppointmentRepository,
    private readonly _socketService: ISocketService,
  ) {}

  async execute(
    appointmentId: string,
    userId: string,
    role: "doctor" | "user",
  ): Promise<Consultation> {
    const appointment =
      await this._appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.APPOINTMENT.NOT_FOUND,
      );
    }

    if (
      (role === "doctor" && appointment.doctorId.toString() !== userId) ||
      (role === "user" && appointment.patientId.toString() !== userId)
    ) {
      throw new CustomError(
        HttpStatusCodes.FORBIDDEN,
        MESSAGES.CONSULTATION.UNAUTHORIZED,
      );
    }

    if (
      appointment.status !== AppointmentStatus.CONFIRMED &&
      appointment.status !== AppointmentStatus.IN_PROGRESS
    ) {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        `Cannot join an appointment with status ${appointment.status}`,
      );
    }

    let consultation =
      await this._consultationRepository.findByAppointmentId(appointmentId);
    const now = new Date();

    if (!consultation) {
      const roomId = `room_${appointmentId}`;
      const newConsultationData = {
        appointmentId: appointment.id!,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        patientJoinedAt: role === "user" ? now : null,
        doctorJoinedAt: role === "doctor" ? now : null,
        startedAt: null,
        endedAt: null,
        roomId,
      };
      consultation =
        await this._consultationRepository.create(newConsultationData);
    } else {
      if (consultation.endedAt) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.CONSULTATION.ALREADY_ENDED,
        );
      }

      const updates: UpdateQuery<IConsultationDocument> = {};
      if (role === "user" && !consultation.patientJoinedAt) {
        updates.patientJoinedAt = now;
      }
      if (role === "doctor" && !consultation.doctorJoinedAt) {
        updates.doctorJoinedAt = now;
      }

      const willBePatientJoined =
        consultation.patientJoinedAt || updates.patientJoinedAt;
      const willBeDoctorJoined =
        consultation.doctorJoinedAt || updates.doctorJoinedAt;

      if (
        willBePatientJoined &&
        willBeDoctorJoined &&
        !consultation.startedAt
      ) {
        updates.startedAt = now;
      }

      if (Object.keys(updates).length > 0) {
        consultation = await this._consultationRepository.update(
          consultation.id!,
          updates,
        );
      }
    }

    if (!consultation) {
      throw new CustomError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        MESSAGES.CONSULTATION.UNABLE_TO_JOIN,
      );
    }

    if (
      consultation.startedAt &&
      appointment.status !== AppointmentStatus.IN_PROGRESS
    ) {
      await this._appointmentRepository.updateStatus(
        appointmentId,
        AppointmentStatus.IN_PROGRESS,
      );
    }

    this._socketService.emitToRoom(consultation.roomId, "user_joined", {
      role,
      joinedAt: now,
      consultation,
    });

    return consultation;
  }
}
