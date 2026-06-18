import { NextFunction, Request, Response } from "express";
import { GetMessagesUseCase } from "../../../application/usecases/consultation/GetMessagesUseCase";
import { SendMessageUseCase } from "../../../application/usecases/consultation/SendMessageUseCase";
import { EditMessageUseCase } from "../../../application/usecases/consultation/EditMessageUseCase";
import { DeleteMessageUseCase } from "../../../application/usecases/consultation/DeleteMessageUseCase";
import { MarkMessageAsReadUseCase } from "../../../application/usecases/consultation/MarkMessageAsReadUseCase";
import { GetChatUploadUrlUseCase } from "../../../application/usecases/consultation/GetChatUploadUrlUseCase";
import { GetChatAccessUrlUseCase } from "../../../application/usecases/consultation/GetChatAccessUrlUseCase";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { socketService } from "../../../infrastructure/socket/SocketIOService";
import { CustomError } from "../../../domain/entities/customError";

export class DoctorMessageController {
  constructor(
    private readonly _getMessagesUseCase: GetMessagesUseCase,
    private readonly _sendMessageUseCase: SendMessageUseCase,
    private readonly _editMessageUseCase: EditMessageUseCase,
    private readonly _deleteMessageUseCase: DeleteMessageUseCase,
    private readonly _markMessageAsReadUseCase: MarkMessageAsReadUseCase,
    private readonly _getChatUploadUrlUseCase: GetChatUploadUrlUseCase,
    private readonly _getChatAccessUrlUseCase: GetChatAccessUrlUseCase,
  ) {}

  getMessages = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { consultationId } = req.params;
      const messages = await this._getMessagesUseCase.execute(consultationId);
      res.json({
        success: true,
        data: messages,
      });
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

      // Broadcast to socket room
      socketService.emitToRoom(roomId, "chat_message", message);

      res.status(HttpStatusCodes.CREATED).json({
        success: true,
        data: message,
      });
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

      // Broadcast edit changes to socket room
      socketService.emitToRoom(roomId, "chat_message_edited", message);

      res.json({
        success: true,
        data: message,
      });
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

      // Broadcast soft-delete changes to socket room
      socketService.emitToRoom(roomId, "chat_message_deleted", message);

      res.json({
        success: true,
        data: message,
      });
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
      const { messageId } = req.params;
      const { roomId } = req.body;

      const message = await this._markMessageAsReadUseCase.execute(messageId);

      // Broadcast read receipt update to socket room
      socketService.emitToRoom(roomId, "chat_message_read", message);

      res.json({
        success: true,
        data: message,
      });
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
      );

      res.status(HttpStatusCodes.OK).json({
        success: true,
        data: result,
      });
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

      res.status(HttpStatusCodes.OK).json({
        success: true,
        data: { accessUrl },
      });
    } catch (error) {
      next(error);
    }
  };
}
