import { IMessageRepository } from "../../../domain/interfaces/repositories/IMessageRepository";
import { MessageDTO } from "../../DTOs/consultation/messageDTO";
import { MessageMapper } from "../../mappers/messageMapper";

export class GetMessagesUseCase {
  constructor(private readonly _messageRepository: IMessageRepository) {}

  async execute(consultationId: string): Promise<MessageDTO[]> {
    const messages = await this._messageRepository.findByConsultationId(consultationId);
    return MessageMapper.toDTOList(messages);
  }
}
