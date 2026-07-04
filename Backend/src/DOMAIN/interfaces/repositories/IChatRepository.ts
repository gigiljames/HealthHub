import { ChatListDTO } from "../../../application/DTOs/consultation/chatListDTO";

export interface IChatRepository {
  findChatsForUser(userId: string, role: "user" | "doctor"): Promise<ChatListDTO[]>;
}
