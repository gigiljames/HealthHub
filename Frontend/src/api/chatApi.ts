import api from "./axios";
import { ROUTES } from "../constants/routes";

export const getChatHistory = async (consultationId: string) => {
  const url = ROUTES.CONSULTATION.GET_MESSAGES.replace(":consultationId", consultationId);
  const response = await api.get(url);
  return response.data;
};

export const sendMessage = async (
  consultationId: string,
  text: string,
  roomId: string,
  replyTo: string | null = null,
) => {
  const url = ROUTES.CONSULTATION.SEND_MESSAGE.replace(":consultationId", consultationId);
  const response = await api.post(url, { text, replyTo, roomId });
  return response.data;
};

export const editMessage = async (messageId: string, text: string, roomId: string) => {
  const url = ROUTES.CONSULTATION.EDIT_MESSAGE.replace(":messageId", messageId);
  const response = await api.put(url, { text, roomId });
  return response.data;
};

export const deleteMessage = async (messageId: string, roomId: string) => {
  const url = ROUTES.CONSULTATION.DELETE_MESSAGE.replace(":messageId", messageId);
  const response = await api.delete(url, { data: { roomId } });
  return response.data;
};

export const markMessageAsRead = async (messageId: string, roomId: string) => {
  const url = ROUTES.CONSULTATION.MARK_MESSAGE_READ.replace(":messageId", messageId);
  const response = await api.post(url, { roomId });
  return response.data;
};
