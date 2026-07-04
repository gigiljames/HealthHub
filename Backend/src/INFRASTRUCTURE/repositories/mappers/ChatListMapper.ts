import { ChatListDTO } from "../../../application/DTOs/consultation/chatListDTO";

export class ChatListMapper {
  static toDTO(doc: any): ChatListDTO {
    const endedAt = doc.endedAt ? new Date(doc.endedAt) : null;

    return {
      consultationId: doc.consultationId ? doc.consultationId.toString() : "",
      roomId: doc.roomId || "",
      recipientId: doc.recipientId ? doc.recipientId.toString() : "",
      recipientName: doc.recipientName || "",
      recipientEmail: doc.recipientEmail || "",
      recipientImageUrl: doc.recipientImageUrl || null,
      recipientSpecialization: doc.recipientSpecialization || null,
      endedAt: endedAt ? endedAt.toISOString() : null,
      slotStart: doc.slotStart ? new Date(doc.slotStart).toISOString() : null,
      isClosed: doc.isClosed,
      unreadCount: doc.unreadCount || 0,
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
      latestMessage: doc.latestMessage && (doc.latestMessage.text || doc.latestMessage.file) ? {
        text: doc.latestMessage.text,
        file: doc.latestMessage.file ? {
          key: doc.latestMessage.file.key,
          name: doc.latestMessage.file.name,
          type: doc.latestMessage.file.type,
          size: doc.latestMessage.file.size,
        } : undefined,
        senderRole: doc.latestMessage.senderRole,
        createdAt: new Date(doc.latestMessage.createdAt).toISOString(),
      } : null,
    };
  }

  static toDTOList(docs: any[]): ChatListDTO[] {
    return docs.map((doc) => this.toDTO(doc));
  }
}
