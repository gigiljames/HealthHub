import { IEndConsultationUseCase } from "../../../domain/interfaces/usecases/consultation/IEndConsultationUseCase";
import { Consultation } from "../../../domain/entities/consultation";
import { IConsultationRepository } from "../../../domain/interfaces/repositories/IConsultationRepository";
import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { ISocketService } from "../../../domain/interfaces/services/ISocketService";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus";

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
        "Consultation not found for this appointment",
      );
    }

    if (consultation.doctorId !== doctorId) {
      throw new CustomError(
        HttpStatusCodes.FORBIDDEN,
        "Only the assigned doctor can end the consultation",
      );
    }

    if (consultation.endedAt) {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        "Consultation has already ended",
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
        "Failed ending consultation record",
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
