import { IMessageRepository } from "../../../domain/interfaces/repositories/IMessageRepository";
import { MessageDTO } from "../../DTOs/consultation/messageDTO";
import { MessageMapper } from "../../mappers/messageMapper";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";

export class DeleteMessageUseCase {
  constructor(private readonly _messageRepository: IMessageRepository) {}

  async execute(messageId: string, senderId: string): Promise<MessageDTO> {
    const message = await this._messageRepository.findById(messageId);
    if (!message) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, MESSAGES.MESSAGE.NOT_FOUND);
    }

    if (message.senderId.toString() !== senderId) {
      throw new CustomError(
        HttpStatusCodes.UNAUTHORIZED,
        "You are not authorized to delete this message",
      );
    }

    const updated = await this._messageRepository.update(messageId, {
      text: "This message was deleted",
      isDeleted: true,
    });

    if (!updated) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, MESSAGES.MESSAGE.NOT_FOUND);
    }

    return MessageMapper.toDTO(updated);
  }
}
