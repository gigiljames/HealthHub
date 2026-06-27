import { Message } from "../../domain/entities/message";
import { MessageDTO } from "../DTOs/consultation/messageDTO";

export class MessageMapper {
  static toEntityFromDocument(doc: any): Message {
    let replyToId: string | null = null;
    let replyToText: string | null = null;
    let replyToRole: "doctor" | "patient" | null = null;

    if (doc.replyTo) {
      if (typeof doc.replyTo === "object" && doc.replyTo._id) {
        replyToId = doc.replyTo._id.toString();
        replyToText = doc.replyTo.isDeleted ? "This message was deleted" : doc.replyTo.text;
        replyToRole = doc.replyTo.senderRole || null;
      } else {
        replyToId = doc.replyTo.toString();
      }
    }

    return new Message({
      id: doc._id ? doc._id.toString() : doc.id,
      consultationId: doc.consultationId ? doc.consultationId.toString() : "",
      roomId: doc.roomId,
      senderId: doc.senderId ? doc.senderId.toString() : "",
      senderRole: doc.senderRole,
      text: doc.text,
      replyTo: replyToId,
      replyToText,
      replyToRole,
      isEdited: doc.isEdited || false,
      isDeleted: doc.isDeleted || false,
      readAt: doc.readAt ? new Date(doc.readAt) : null,
      file: doc.file ? {
        key: doc.file.key,
        name: doc.file.name,
        type: doc.file.type,
        size: doc.file.size,
      } : undefined,
      createdAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : undefined,
    });
  }

  static toDTO(entity: Message): MessageDTO {
    return {
      id: entity.id || "",
      consultationId: entity.consultationId,
      roomId: entity.roomId,
      senderId: entity.senderId,
      senderRole: entity.senderRole,
      text: entity.text,
      replyTo: entity.replyTo,
      replyToText: entity.replyToText,
      replyToRole: entity.replyToRole,
      isEdited: entity.isEdited,
      isDeleted: entity.isDeleted,
      readAt: entity.readAt ? entity.readAt.toISOString() : null,
      createdAt: entity.createdAt ? entity.createdAt.toISOString() : "",
      updatedAt: entity.updatedAt ? entity.updatedAt.toISOString() : "",
      file: entity.file ? {
        key: entity.file.key,
        name: entity.file.name,
        type: entity.file.type,
        size: entity.file.size,
      } : undefined,
    };
  }

  static toDTOList(entities: Message[]): MessageDTO[] {
    return entities.map((e) => this.toDTO(e));
  }

  static toEntityList(docs: any[]): Message[] {
    return docs.map((doc) => this.toEntityFromDocument(doc));
  }
}
