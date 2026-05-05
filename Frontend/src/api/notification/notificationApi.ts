import type {
  INotification,
  PaginatedNotifications,
} from "../../types/notification";
import api from "../axios";

export const getNotifications = async (
  page: number,
  limit: number,
): Promise<PaginatedNotifications> => {
  const response = await api.get(`/notifications?page=${page}&limit=${limit}`);
  return response.data.data;
};

export const getUnreadNotificationCount = async (): Promise<number> => {
  const response = await api.get("/notifications/unread-count");
  return response.data.data;
};

export const markNotificationAsRead = async (
  id: string,
): Promise<INotification> => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data.data;
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await api.patch("/notifications/mark-all-read");
};
