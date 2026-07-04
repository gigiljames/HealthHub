export interface ChatListDTO {
  consultationId: string;
  roomId: string;
  recipientId: string;
  recipientName: string;
  recipientEmail: string;
  recipientImageUrl: string | null;
  recipientSpecialization?: string | null;
  endedAt: string | null;
  slotStart: string | null;
  isClosed: boolean;
  unreadCount: number;
  createdAt: string;
  latestMessage?: {
    text?: string;
    file?: {
      key: string;
      name: string;
      type: "image" | "video" | "document";
      size: number;
    };
    senderRole: "doctor" | "patient";
    createdAt: string;
  } | null;
}
