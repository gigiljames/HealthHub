import { IEndConsultationUseCase } from "../../../domain/interfaces/usecases/consultation/IEndConsultationUseCase";
import { Consultation } from "../../../domain/entities/consultation";
import { IConsultationRepository } from "../../../domain/interfaces/repositories/IConsultationRepository";
import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { ISocketService } from "../../../domain/interfaces/services/ISocketService";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus";
import { MESSAGES } from "../../../domain/constants/messages";

export class EndConsultationUseCase implements IEndConsultationUseCase {
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
    const consultation =
      await this._consultationRepository.findByAppointmentId(appointmentId);

    if (!consultation) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.CONSULTATION.NOT_FOUND,
      );
    }

    if (role === "doctor" && consultation.doctorId !== userId) {
      throw new CustomError(
        HttpStatusCodes.FORBIDDEN,
        MESSAGES.CONSULTATION.ONLY_DOCTOR_CAN_END,
      );
    }

    if (role === "user" && consultation.patientId !== userId) {
      throw new CustomError(
        HttpStatusCodes.FORBIDDEN,
        "Only the assigned patient can end the consultation",
      );
    }

    if (consultation.endedAt) {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        MESSAGES.CONSULTATION.ALREADY_ENDED,
      );
    }

    const now = new Date();
    const updatedConsultation = await this._consultationRepository.update(
      consultation.id!,
      { endedAt: now },
    );

    if (!updatedConsultation) {
      throw new CustomError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        MESSAGES.CONSULTATION.FAILED_TO_END,
      );
    }

    await this._appointmentRepository.updateStatus(
      appointmentId,
      AppointmentStatus.COMPLETED,
    );

    this._socketService.emitToRoom(
      updatedConsultation.roomId,
      "consultation_ended",
      {
        endedAt: now,
        consultation: updatedConsultation,
        endedBy: role === "user" ? "patient" : "doctor",
      },
    );

    return updatedConsultation;
  }
}
