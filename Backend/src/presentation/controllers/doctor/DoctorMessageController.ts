import { NextFunction, Request, Response } from "express";
import { GetMessagesUseCase } from "../../../application/usecases/consultation/GetMessagesUseCase";
import { SendMessageUseCase } from "../../../application/usecases/consultation/SendMessageUseCase";
import { EditMessageUseCase } from "../../../application/usecases/consultation/EditMessageUseCase";
import { DeleteMessageUseCase } from "../../../application/usecases/consultation/DeleteMessageUseCase";
import { MarkMessageAsReadUseCase } from "../../../application/usecases/consultation/MarkMessageAsReadUseCase";
import { GetChatUploadUrlUseCase } from "../../../application/usecases/consultation/GetChatUploadUrlUseCase";
import { GetChatAccessUrlUseCase } from "../../../application/usecases/consultation/GetChatAccessUrlUseCase";
import { GetChatsUseCase } from "../../../application/usecases/consultation/GetChatsUseCase";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { socketService } from "../../../infrastructure/socket/SocketIOService";
import { CustomError } from "../../../domain/entities/customError";
import { notificationModel } from "../../../infrastructure/DB/models/notificationModel";
import { consultationModel } from "../../../infrastructure/DB/models/consultationModel";
import { authModel } from "../../../infrastructure/DB/models/authModel";
import { messageModel } from "../../../infrastructure/DB/models/messageModel";
import { Roles } from "../../../domain/enums/roles";
import { NotificationType } from "../../../domain/enums/notificationType";
import { HTTPResponseBuilder } from "../../../utils/httpResponseBuilder";
import { logger } from "../../../utils/logger";

export class DoctorMessageController {
  constructor(
    private readonly _getMessagesUseCase: GetMessagesUseCase,
    private readonly _sendMessageUseCase: SendMessageUseCase,
    private readonly _editMessageUseCase: EditMessageUseCase,
    private readonly _deleteMessageUseCase: DeleteMessageUseCase,
    private readonly _markMessageAsReadUseCase: MarkMessageAsReadUseCase,
    private readonly _getChatUploadUrlUseCase: GetChatUploadUrlUseCase,
    private readonly _getChatAccessUrlUseCase: GetChatAccessUrlUseCase,
    private readonly _getChatsUseCase: GetChatsUseCase,
  ) { }

  getMessages = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { consultationId } = req.params;
      const page = req.query.page ? Number(req.query.page) : undefined;
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const { messages, chatStatus } = await this._getMessagesUseCase.execute(consultationId, page, limit);
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Messages fetched successfully",
        { messages, chatStatus },
      );
    } catch (error) {
      next(error);
    }
  };

  sendMessage = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new CustomError(HttpStatusCodes.UNAUTHORIZED, "Unauthorized");
      }
      const { consultationId } = req.params;
      const { text, replyTo, roomId, file } = req.body;

      const message = await this._sendMessageUseCase.execute({
        consultationId,
        roomId,
        senderId: req.user.userId,
        senderRole: "doctor",
        text,
        replyTo: replyTo || null,
        file: file || undefined,
      });

      socketService.emitToRoom(roomId, "chat_message", message);

      // Notify the patient about the new message
      try {
        const consultation = await consultationModel.findById(consultationId).lean();
        if (consultation?.patientId) {
          const patientIdStr = consultation.patientId.toString();
          const senderAuth = await authModel.findById(req.user.userId).lean();
          const senderName = senderAuth?.name || "Doctor";

          const unreadCount = await messageModel.countDocuments({
            consultationId,
            senderRole: "doctor",
            readAt: null,
          });

          let notification = await notificationModel.findOne({
            userId: patientIdStr,
            referenceId: consultation._id,
            type: NotificationType.CHAT_MESSAGE,
          });

          const notificationMsg = `Dr. ${senderName} sent you ${unreadCount} message${unreadCount > 1 ? "s" : ""}`;

          if (notification) {
            notification.message = notificationMsg;
            notification.isRead = false;
            notification.markModified("message");
            notification.markModified("isRead");
            await notification.save();
          } else {
            notification = await notificationModel.create({
              userId: patientIdStr,
              role: Roles.USER,
              title: "New Chat Message",
              message: notificationMsg,
              type: NotificationType.CHAT_MESSAGE,
              referenceId: consultation._id,
            });
          }

          socketService.emitToUser(patientIdStr, "new_notification", {
            id: String(notification._id),
            userId: patientIdStr,
            role: Roles.USER,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            isRead: false,
            referenceId: consultation._id,
            createdAt: notification.updatedAt || notification.createdAt,
          });
        }
      } catch (_notifErr) {
        logger.error(_notifErr);
      }

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.CREATED,
        "Message sent successfully",
        message,
      );
    } catch (error) {
      next(error);
    }
  };

  editMessage = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new CustomError(HttpStatusCodes.UNAUTHORIZED, "Unauthorized");
      }
      const { messageId } = req.params;
      const { text, roomId } = req.body;

      const message = await this._editMessageUseCase.execute(
        messageId,
        req.user.userId,
        text,
      );

      socketService.emitToRoom(roomId, "chat_message_edited", message);

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Message edited successfully",
        message,
      );
    } catch (error) {
      next(error);
    }
  };

  deleteMessage = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new CustomError(HttpStatusCodes.UNAUTHORIZED, "Unauthorized");
      }
      const { messageId } = req.params;
      const { roomId } = req.body;

      const message = await this._deleteMessageUseCase.execute(
        messageId,
        req.user.userId,
      );

      socketService.emitToRoom(roomId, "chat_message_deleted", message);

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Message deleted successfully",
        message,
      );
    } catch (error) {
      next(error);
    }
  };

  markAsRead = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new CustomError(HttpStatusCodes.UNAUTHORIZED, "Unauthorized");
      }
      const { messageIds, roomId } = req.body;
      if (!Array.isArray(messageIds) || messageIds.length === 0) {
        throw new CustomError(HttpStatusCodes.BAD_REQUEST, "Invalid messageIds");
      }

      const results = [];
      const readAt = new Date();
      for (const messageId of messageIds) {
        const message = await this._markMessageAsReadUseCase.execute(messageId);
        results.push(message);
      }

      socketService.emitToRoom(roomId, "chat_messages_read", { messageIds, roomId, readAt: readAt.toISOString() });

      // If all incoming messages are read, delete the notification and emit event
      try {
        const firstMsg = results[0];
        if (firstMsg) {
          const consultId = firstMsg.consultationId;
          const remainingUnread = await messageModel.countDocuments({
            consultationId: consultId,
            senderRole: "patient",
            readAt: null,
          });
          if (remainingUnread === 0) {
            await notificationModel.deleteOne({
              userId: req.user.userId,
              referenceId: consultId,
              type: NotificationType.CHAT_MESSAGE,
            });
            socketService.emitToUser(req.user.userId, "notification_deleted", {
              referenceId: consultId,
              type: NotificationType.CHAT_MESSAGE,
            });
          }
        }
      } catch (_notifErr) {
        logger.error(_notifErr);
      }

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Messages marked as read successfully",
        results,
      );
    } catch (error) {
      next(error);
    }
  };

  getChatUploadUrl = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new CustomError(HttpStatusCodes.UNAUTHORIZED, "Unauthorized");
      }
      const { consultationId } = req.params;
      const { fileName, contentType, fileSize } = req.body;

      const result = await this._getChatUploadUrlUseCase.execute(
        consultationId,
        fileName,
        contentType,
        Number(fileSize),
        "doctor"
      );

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Upload signed URL generated successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  };

  getChatAccessUrl = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new CustomError(HttpStatusCodes.UNAUTHORIZED, "Unauthorized");
      }
      const { messageId } = req.params;
      const download = req.query.download === "true";

      const accessUrl = await this._getChatAccessUrlUseCase.execute(messageId, download);

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Access URL retrieved successfully",
        { accessUrl },
      );
    } catch (error) {
      next(error);
    }
  };

  getChats = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new CustomError(HttpStatusCodes.UNAUTHORIZED, "Unauthorized");
      }
      const chats = await this._getChatsUseCase.execute({
        userId: req.user.userId,
        role: "doctor",
      });
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Chats retrieved successfully",
        chats,
      );
    } catch (error) {
      next(error);
    }
  };
}

