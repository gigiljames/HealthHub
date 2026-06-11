import { IMessageRepository } from "../../../domain/interfaces/repositories/IMessageRepository";
import { MessageDTO } from "../../DTOs/consultation/messageDTO";
import { MessageMapper } from "../../mappers/messageMapper";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";

export class MarkMessageAsReadUseCase {
  constructor(private readonly _messageRepository: IMessageRepository) {}

  async execute(messageId: string): Promise<MessageDTO> {
    const message = await this._messageRepository.findById(messageId);
    if (!message) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, MESSAGES.MESSAGE.NOT_FOUND);
    }

    // Only update if not already read
    if (message.readAt) {
      return MessageMapper.toDTO(message);
    }

    const updated = await this._messageRepository.update(messageId, {
      readAt: new Date(),
    });

    return MessageMapper.toDTO(updated);
  }
}
