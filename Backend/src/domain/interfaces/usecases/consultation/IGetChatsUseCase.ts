import { ChatListDTO } from "../../../../application/DTOs/consultation/chatListDTO";

export interface GetChatsInputDTO {
  userId: string;
  role: "user" | "doctor";
}

export interface IGetChatsUseCase {
  execute(input: GetChatsInputDTO): Promise<ChatListDTO[]>;
}
