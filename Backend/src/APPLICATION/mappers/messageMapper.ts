import { MessageDTO } from "../DTOs/consultation/messageDTO";

export class MessageMapper {
  static toDTO(doc: any): MessageDTO {
    let replyToId: string | null = null;
    let replyToText: string | null = null;
    let replyToRole: "doctor" | "patient" | null = null;

    if (doc.replyTo) {
      if (typeof doc.replyTo === "object" && doc.replyTo._id) {
        replyToId = doc.replyTo._id.toString();
        // If parent message is deleted, hide original text in reply quote
        replyToText = doc.replyTo.isDeleted ? "This message was deleted" : doc.replyTo.text;
        replyToRole = doc.replyTo.senderRole || null;
      } else {
        replyToId = doc.replyTo.toString();
      }
    }

    return {
      id: doc._id.toString(),
      consultationId: doc.consultationId.toString(),
      roomId: doc.roomId,
      senderId: doc.senderId.toString(),
      senderRole: doc.senderRole,
      text: doc.text,
      replyTo: replyToId,
      replyToText,
      replyToRole,
      isEdited: doc.isEdited || false,
      isDeleted: doc.isDeleted || false,
      readAt: doc.readAt ? doc.readAt.toISOString() : null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
      file: doc.file ? {
        key: doc.file.key,
        name: doc.file.name,
        type: doc.file.type,
        size: doc.file.size,
      } : undefined,
    };
  }

  static toDTOList(docs: any[]): MessageDTO[] {
    return docs.map((doc) => this.toDTO(doc));
  }
}
