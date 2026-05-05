import { NotificationType } from "../enums/notificationType";
import { Roles } from "../enums/roles";

export interface CreateNotificationDTO {
  userId: string;
  role: Roles;
  title: string;
  message: string;
  type: NotificationType;
  referenceId?: string | null;
}

export interface NotificationResponseDTO {
  id: string;
  userId: string;
  role: Roles;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  referenceId?: string | null;
  createdAt: string;
}

export interface PaginatedNotificationsDTO {
  notifications: NotificationResponseDTO[];
  total: number;
  totalPages: number;
  currentPage: number;
}
