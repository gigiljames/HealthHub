export const NotificationType = {
  APPOINTMENT_BOOKED: "APPOINTMENT_BOOKED",
  APPOINTMENT_CANCELLED: "APPOINTMENT_CANCELLED",
  APPOINTMENT_REMINDER: "APPOINTMENT_REMINDER",
  CONSULTATION_JOINED: "CONSULTATION_JOINED",
  CONSULTATION_REPORTS_ADDED: "CONSULTATION_REPORTS_ADDED",
  PASSWORD_CHANGED: "PASSWORD_CHANGED",
  SYSTEM: "SYSTEM",
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

export interface INotification {
  id: string;
  userId: string;
  role: "user" | "doctor" | "admin";
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  referenceId?: string | null;
  createdAt: string;
}

export interface PaginatedNotifications {
  notifications: INotification[];
  total: number;
  totalPages: number;
  currentPage: number;
}
