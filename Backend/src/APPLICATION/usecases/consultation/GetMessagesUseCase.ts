import { IMessageRepository } from "../../../domain/interfaces/repositories/IMessageRepository";
import { IConsultationRepository } from "../../../domain/interfaces/repositories/IConsultationRepository";
import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { ISlotRepository } from "../../../domain/interfaces/repositories/ISlotRepository";
import { MessageDTO } from "../../DTOs/consultation/messageDTO";
import { MessageMapper } from "../../mappers/messageMapper";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";

export interface GetMessagesResponseDTO {
  messages: MessageDTO[];
  chatStatus: {
    endedAt: string | null;
    isClosed: boolean;
    closeReason: "7_DAYS_PASSED" | "MESSAGE_LIMIT_REACHED" | null;
    patientMessagesLeft: number;
    slotMode: "online" | "in-person";
  };
}

export class GetMessagesUseCase {
  constructor(
    private readonly _messageRepository: IMessageRepository,
    private readonly _consultationRepository: IConsultationRepository,
    private readonly _appointmentRepository: IAppointmentRepository,
    private readonly _slotRepository: ISlotRepository
  ) {}

  async execute(consultationId: string, page?: number, limit?: number): Promise<GetMessagesResponseDTO> {
    const consultation = await this._consultationRepository.findById(consultationId);
    if (!consultation) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Consultation not found");
    }

    const appointment = await this._appointmentRepository.findById(consultation.appointmentId);
    if (!appointment) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Appointment not found");
    }

    const slot = await this._slotRepository.findById(appointment.slotId);
    if (!slot) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Slot not found");
    }

    const messages = await this._messageRepository.findByConsultationId(consultationId, page, limit);
    const messagesDTO = MessageMapper.toDTOList(messages);

    let isClosed = false;
    let closeReason: "7_DAYS_PASSED" | "MESSAGE_LIMIT_REACHED" | null = null;
    let patientMessagesLeft = 30;

    if (consultation.endedAt) {
      const endedTime = new Date(consultation.endedAt).getTime();
      const currentTime = Date.now();
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

      if (currentTime - endedTime > sevenDaysMs) {
        isClosed = true;
        closeReason = "7_DAYS_PASSED";
        patientMessagesLeft = 0;
      } else {
        const postConsultationMessagesCount = await this._messageRepository.countPatientMessagesAfterDate(
          consultationId,
          new Date(consultation.endedAt)
        );
        patientMessagesLeft = Math.max(0, 30 - postConsultationMessagesCount);
        if (patientMessagesLeft <= 0) {
          isClosed = true;
          closeReason = "MESSAGE_LIMIT_REACHED";
        }
      }
    }

    return {
      messages: messagesDTO,
      chatStatus: {
        endedAt: consultation.endedAt ? new Date(consultation.endedAt).toISOString() : null,
        isClosed,
        closeReason,
        patientMessagesLeft,
        slotMode: slot.mode,
      },
    };
  }
}
