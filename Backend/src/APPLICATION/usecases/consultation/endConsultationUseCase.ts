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
    private readonly consultationRepository: IConsultationRepository,
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly socketService: ISocketService,
  ) {}

  async execute(
    appointmentId: string,
    doctorId: string,
  ): Promise<Consultation> {
    const consultation =
      await this.consultationRepository.findByAppointmentId(appointmentId);

    if (!consultation) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.CONSULTATION.NOT_FOUND,
      );
    }

    if (consultation.doctorId !== doctorId) {
      throw new CustomError(
        HttpStatusCodes.FORBIDDEN,
        MESSAGES.CONSULTATION.ONLY_DOCTOR_CAN_END,
      );
    }

    if (consultation.endedAt) {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        MESSAGES.CONSULTATION.ALREADY_ENDED,
      );
    }

    const now = new Date();
    const updatedConsultation = await this.consultationRepository.update(
      consultation.id!,
      { endedAt: now },
    );

    if (!updatedConsultation) {
      throw new CustomError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        MESSAGES.CONSULTATION.FAILED_TO_END,
      );
    }

    await this.appointmentRepository.updateStatus(
      appointmentId,
      AppointmentStatus.COMPLETED,
    );

    this.socketService.emitToRoom(
      updatedConsultation.roomId,
      "consultation_ended",
      { endedAt: now, consultation: updatedConsultation },
    );

    return updatedConsultation;
  }
}
