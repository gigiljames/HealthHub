import { IMessageRepository, IMessageCreateData } from "../../../domain/interfaces/repositories/IMessageRepository";
import { IConsultationRepository } from "../../../domain/interfaces/repositories/IConsultationRepository";
import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { ISlotRepository } from "../../../domain/interfaces/repositories/ISlotRepository";
import { MessageDTO } from "../../DTOs/consultation/messageDTO";
import { MessageMapper } from "../../mappers/messageMapper";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";

export class SendMessageUseCase {
  constructor(
    private readonly _messageRepository: IMessageRepository,
    private readonly _consultationRepository: IConsultationRepository,
    private readonly _appointmentRepository: IAppointmentRepository,
    private readonly _slotRepository: ISlotRepository
  ) {}

  async execute(data: IMessageCreateData): Promise<MessageDTO> {
    const consultation = await this._consultationRepository.findById(data.consultationId);
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

    if (slot.mode === "in-person") {
      throw new CustomError(HttpStatusCodes.FORBIDDEN, "Chat is not available for in-person consultations.");
    }

    if (data.senderRole === "patient" && consultation.endedAt) {
      const endedTime = new Date(consultation.endedAt).getTime();
      const currentTime = Date.now();
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

      if (currentTime - endedTime > sevenDaysMs) {
        throw new CustomError(
          HttpStatusCodes.FORBIDDEN,
          "Chat is closed. You can only send messages up to 7 days after the consultation."
        );
      }

      const postConsultationMessagesCount = await this._messageRepository.countPatientMessagesAfterDate(
        data.consultationId,
        new Date(consultation.endedAt)
      );

      if (postConsultationMessagesCount >= 30) {
        throw new CustomError(
          HttpStatusCodes.FORBIDDEN,
          "Message limit reached. You can only send up to 30 messages after the consultation."
        );
      }
    }

    const rawMessage = await this._messageRepository.create(data);
    const populated = await this._messageRepository.findById(rawMessage.id!);
    if (!populated) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Failed to retrieve sent message");
    }
    return MessageMapper.toDTO(populated);
  }
}
