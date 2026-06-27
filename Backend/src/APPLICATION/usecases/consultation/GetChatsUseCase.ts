import { IGetChatsUseCase, GetChatsInputDTO } from "../../../domain/interfaces/usecases/consultation/IGetChatsUseCase";
import { IChatRepository } from "../../../domain/interfaces/repositories/IChatRepository";
import { ChatListDTO } from "../../DTOs/consultation/chatListDTO";

export class GetChatsUseCase implements IGetChatsUseCase {
  constructor(private readonly _chatRepository: IChatRepository) {}

  async execute(input: GetChatsInputDTO): Promise<ChatListDTO[]> {
    return await this._chatRepository.findChatsForUser(input.userId, input.role);
  }
}
