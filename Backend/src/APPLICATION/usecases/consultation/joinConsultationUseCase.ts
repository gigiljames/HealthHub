import { Consultation } from "../../../domain/entities/consultation";
import { CustomError } from "../../../domain/entities/customError";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { IConsultationRepository } from "../../../domain/interfaces/repositories/IConsultationRepository";
import { ISocketService } from "../../../domain/interfaces/services/ISocketService";
import { IJoinConsultationUseCase } from "../../../domain/interfaces/usecases/consultation/IJoinConsultationUseCase";

export class JoinConsultationUseCase implements IJoinConsultationUseCase {
  constructor(
    private readonly consultationRepository: IConsultationRepository,
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly socketService: ISocketService,
  ) {}

  async execute(
    appointmentId: string,
    userId: string,
    role: "doctor" | "user",
  ): Promise<Consultation> {
    const appointment =
      await this.appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Appointment not found");
    }

    if (
      (role === "doctor" && appointment.doctorId.toString() !== userId) ||
      (role === "user" && appointment.patientId.toString() !== userId)
    ) {
      throw new CustomError(
        HttpStatusCodes.FORBIDDEN,
        "Unauthorized to join this consultation",
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
      await this.consultationRepository.findByAppointmentId(appointmentId);
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
        await this.consultationRepository.create(newConsultationData);
    } else {
      if (consultation.endedAt) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          "This consultation has already ended.",
        );
      }

      const updates: any = {};
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
        consultation = await this.consultationRepository.update(
          consultation.id!,
          updates,
        );
      }
    }

    if (!consultation) {
      throw new CustomError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        "Failed resolving consultation record",
      );
    }

    if (
      consultation.startedAt &&
      appointment.status !== AppointmentStatus.IN_PROGRESS
    ) {
      await this.appointmentRepository.updateStatus(
        appointmentId,
        AppointmentStatus.IN_PROGRESS,
      );
    }

    this.socketService.emitToRoom(consultation.roomId, "user_joined", {
      role,
      joinedAt: now,
      consultation,
    });

    return consultation;
  }
}
