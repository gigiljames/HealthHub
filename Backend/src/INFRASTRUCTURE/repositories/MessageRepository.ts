import {
  IMessageRepository,
  IMessageCreateData,
} from "../../domain/interfaces/repositories/IMessageRepository";
import { messageModel } from "../DB/models/messageModel";

export class MessageRepository implements IMessageRepository {
  async create(data: IMessageCreateData): Promise<any> {
    const newMessage = new messageModel({
      consultationId: data.consultationId,
      roomId: data.roomId,
      senderId: data.senderId,
      senderRole: data.senderRole,
      text: data.text,
      replyTo: data.replyTo || null,
      file: data.file,
    });
    await newMessage.save();
    return newMessage.toObject();
  }

  async findByConsultationId(consultationId: string): Promise<any[]> {
    return await messageModel
      .find({ consultationId })
      .populate("replyTo")
      .sort({ createdAt: 1 })
      .lean();
  }

  async findById(messageId: string): Promise<any | null> {
    return await messageModel
      .findById(messageId)
      .populate("replyTo")
      .lean();
  }

  async update(
    messageId: string,
    updates: Partial<{
      text: string;
      isEdited: boolean;
      isDeleted: boolean;
      readAt: Date | null;
    }>,
  ): Promise<any | null> {
    return await messageModel
      .findByIdAndUpdate(messageId, updates, { new: true })
      .populate("replyTo")
      .lean();
  }
}
