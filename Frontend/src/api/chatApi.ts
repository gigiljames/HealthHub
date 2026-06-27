import api from "./axios";
import { ROUTES } from "../constants/routes";

export const getChatHistory = async (consultationId: string) => {
  const url = ROUTES.CONSULTATION.GET_MESSAGES.replace(":consultationId", consultationId);
  const response = await api.get(url);
  return response.data;
};

export const sendMessage = async (
  consultationId: string,
  text: string | undefined,
  roomId: string,
  replyTo: string | null = null,
  file?: { key: string; name: string; type: "image" | "video" | "document"; size: number },
) => {
  const url = ROUTES.CONSULTATION.SEND_MESSAGE.replace(":consultationId", consultationId);
  const response = await api.post(url, { text, replyTo, roomId, file });
  return response.data;
};

export const getChatUploadUrl = async (
  consultationId: string,
  fileName: string,
  contentType: string,
  fileSize: number,
) => {
  const url = ROUTES.CONSULTATION.GET_CHAT_UPLOAD_URL.replace(":consultationId", consultationId);
  const response = await api.post(url, { fileName, contentType, fileSize });
  return response.data;
};

export const uploadFileToS3 = async (uploadUrl: string, file: File) => {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to upload file directly to S3");
  }
  return true;
};

export const getChatAccessUrl = async (messageId: string, download = false) => {
  const url = ROUTES.CONSULTATION.GET_CHAT_ACCESS_URL.replace(":messageId", messageId) + `?download=${download}`;
  const response = await api.get(url);
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

export const getChats = async () => {
  const response = await api.get(ROUTES.CONSULTATION.GET_CHATS);
  return response.data;
};
