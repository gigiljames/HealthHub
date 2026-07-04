import Notification from "../../../domain/entities/notification";
import { Roles } from "../../../domain/enums/roles";

export interface PaginatedNotifications {
  notifications: Notification[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export interface INotificationRepository {
  create(notification: Notification): Promise<Notification>;
  getByUser(
    userId: string,
    role: Roles,
    page: number,
    limit: number,
  ): Promise<PaginatedNotifications>;
  getUnreadCount(userId: string, role: Roles): Promise<number>;
  markAsRead(notificationId: string): Promise<Notification | null>;
  markAllAsRead(userId: string, role: Roles): Promise<void>;
}
