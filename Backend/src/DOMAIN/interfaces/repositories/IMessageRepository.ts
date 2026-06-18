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
  create(data: IMessageCreateData): Promise<any>;
  findByConsultationId(consultationId: string): Promise<any[]>;
  findById(messageId: string): Promise<any | null>;
  update(
    messageId: string,
    updates: Partial<{
      text: string;
      isEdited: boolean;
      isDeleted: boolean;
      readAt: Date | null;
    }>,
  ): Promise<any | null>;
}
