import { Message } from "../../entities/message";

export interface IMessageCreateData {
  consultationId: string;
  roomId: string;
  senderId: string;
  senderRole: "doctor" | "patient";
  text?: string;
  replyTo?: string | null;
  file?: {
    key: string;
    name: string;
    type: "image" | "video" | "document";
    size: number;
  };
}

export interface IMessageRepository {
  create(data: IMessageCreateData): Promise<Message>;
  findByConsultationId(consultationId: string): Promise<Message[]>;
  findById(messageId: string): Promise<Message | null>;
  update(
    messageId: string,
    updates: Partial<{
      text: string;
      isEdited: boolean;
      isDeleted: boolean;
      readAt: Date | null;
    }>,
  ): Promise<Message | null>;
  countPatientMessagesAfterDate(consultationId: string, date: Date): Promise<number>;
}
