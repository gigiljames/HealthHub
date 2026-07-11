import { Message } from "../../domain/entities/message";
import { MessageDTO } from "../DTOs/consultation/messageDTO";
import { IMessageDoc } from "../../infrastructure/DB/models/messageModel";

export class MessageMapper {
  static toEntityFromDocument(doc: IMessageDoc): Message {
    let replyToId: string | null = null;
    let replyToText: string | null = null;
    let replyToRole: "doctor" | "patient" | null = null;

    if (doc.replyTo) {
      if (
        typeof doc.replyTo === "object" &&
        doc.replyTo !== null &&
        "senderRole" in doc.replyTo
      ) {
        const replyObj = doc.replyTo as IMessageDoc;
        replyToId = replyObj._id ? replyObj._id.toString() : (replyObj._id || null);
        replyToText = replyObj.isDeleted ? "This message was deleted" : replyObj.text || null;
        replyToRole = replyObj.senderRole || null;
      } else {
        replyToId = doc.replyTo.toString();
      }
    }

    return new Message({
      id: doc._id ? doc._id.toString() : doc._id,
      consultationId: doc.consultationId ? doc.consultationId.toString() : "",
      roomId: doc.roomId || "",
      senderId: doc.senderId ? doc.senderId.toString() : "",
      senderRole: doc.senderRole || "patient",
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

  static toEntityList(docs: IMessageDoc[]): Message[] {
    return docs.map((doc) => this.toEntityFromDocument(doc));
  }
}
