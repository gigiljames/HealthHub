import {
  IMessageRepository,
  IMessageCreateData,
} from "../../domain/interfaces/repositories/IMessageRepository";
import { Message } from "../../domain/entities/message";
import { messageModel } from "../DB/models/messageModel";
import { MessageMapper } from "../../application/mappers/messageMapper";
import { Types } from "mongoose";

export class MessageRepository implements IMessageRepository {
  async create(data: IMessageCreateData): Promise<Message> {
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
    return MessageMapper.toEntityFromDocument(newMessage.toObject());
  }

  async findByConsultationId(consultationId: string): Promise<Message[]> {
    const docs = await messageModel
      .find({ consultationId })
      .populate("replyTo")
      .sort({ createdAt: 1 })
      .lean();
    return MessageMapper.toEntityList(docs);
  }

  async findById(messageId: string): Promise<Message | null> {
    const doc = await messageModel
      .findById(messageId)
      .populate("replyTo")
      .lean();
    return doc ? MessageMapper.toEntityFromDocument(doc) : null;
  }

  async update(
    messageId: string,
    updates: Partial<{
      text: string;
      isEdited: boolean;
      isDeleted: boolean;
      readAt: Date | null;
    }>,
  ): Promise<Message | null> {
    const doc = await messageModel
      .findByIdAndUpdate(messageId, updates, { new: true })
      .populate("replyTo")
      .lean();
    return doc ? MessageMapper.toEntityFromDocument(doc) : null;
  }

  async countPatientMessagesAfterDate(consultationId: string, date: Date): Promise<number> {
    return await messageModel.countDocuments({
      consultationId: new Types.ObjectId(consultationId),
      senderRole: "patient",
      createdAt: { $gt: date },
    });
  }
}
