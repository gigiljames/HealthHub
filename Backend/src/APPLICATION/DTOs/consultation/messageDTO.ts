export interface MessageDTO {
  id: string;
  consultationId: string;
  roomId: string;
  senderId: string;
  senderRole: "doctor" | "patient";
  text?: string;
  replyTo: string | null;
  replyToText: string | null;
  replyToRole: "doctor" | "patient" | null;
  isEdited: boolean;
  isDeleted: boolean;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
  file?: {
    key: string;
    name: string;
    type: "image" | "video" | "document";
    size: number;
  };
}
