import { IMessageRepository, IMessageCreateData } from "../../../domain/interfaces/repositories/IMessageRepository";
import { MessageDTO } from "../../DTOs/consultation/messageDTO";
import { MessageMapper } from "../../mappers/messageMapper";

export class SendMessageUseCase {
  constructor(private readonly _messageRepository: IMessageRepository) {}

  async execute(data: IMessageCreateData): Promise<MessageDTO> {
    const rawMessage = await this._messageRepository.create(data);
    // Fetch populated version to ensure replyTo fields are loaded correctly if populated
    const populated = await this._messageRepository.findById(rawMessage._id.toString());
    return MessageMapper.toDTO(populated);
  }
}
