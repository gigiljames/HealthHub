import { IGetChatsUseCase, GetChatsInputDTO } from "../../../domain/interfaces/usecases/consultation/IGetChatsUseCase";
import { IChatRepository } from "../../../domain/interfaces/repositories/IChatRepository";
import { ChatListDTO } from "../../DTOs/consultation/chatListDTO";
import { IS3Service } from "../../../domain/interfaces/services/IS3Service";

export class GetChatsUseCase implements IGetChatsUseCase {
  constructor(
    private readonly _chatRepository: IChatRepository,
    private readonly _s3Service: IS3Service,
  ) {}

  async execute(input: GetChatsInputDTO): Promise<ChatListDTO[]> {
    const chats = await this._chatRepository.findChatsForUser(input.userId, input.role);

    await Promise.all(
      chats.map(async (chat) => {
        if (chat.recipientImageUrl) {
          try {
            chat.recipientImageUrl = await this._s3Service.getAccessSignedUrl(chat.recipientImageUrl);
          } catch (error) {
            console.error("Error signing recipient image URL:", error);
          }
        }
      })
    );

    return chats;
  }
}
