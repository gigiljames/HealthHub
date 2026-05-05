import { Request, Response, NextFunction } from "express";
import { IGetUserNotificationsUseCase } from "../../../domain/interfaces/usecases/notification/IGetUserNotificationsUseCase";
import { IMarkNotificationReadUseCase } from "../../../domain/interfaces/usecases/notification/IMarkNotificationReadUseCase";
import { IGetUnreadNotificationCountUseCase } from "../../../domain/interfaces/usecases/notification/IGetUnreadNotificationCountUseCase";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";
import { Roles } from "../../../domain/enums/roles";
import { logger } from "../../../utils/logger";

export class NotificationController {
  constructor(
    private readonly _getUserNotificationsUseCase: IGetUserNotificationsUseCase,
    private readonly _markNotificationReadUseCase: IMarkNotificationReadUseCase,
    private readonly _getUnreadNotificationCountUseCase: IGetUnreadNotificationCountUseCase,
  ) {}

  getNotifications = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new CustomError(
          HttpStatusCodes.UNAUTHORIZED,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const role = req.user.role as Roles; // USER or DOCTOR

      const data = await this._getUserNotificationsUseCase.execute(
        req.user.userId,
        role,
        page,
        limit,
      );

      res.status(HttpStatusCodes.OK).json({
        success: true,
        message: "Notifications fetched successfully",
        data,
      });
    } catch (error) {
      logger.error("Error fetching notifications:", error);
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
        throw new CustomError(
          HttpStatusCodes.UNAUTHORIZED,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }

      const { id } = req.params;
      const data = await this._markNotificationReadUseCase.execute(id);

      res.status(HttpStatusCodes.OK).json({
        success: true,
        message: "Notification marked as read",
        data,
      });
    } catch (error) {
      logger.error("Error marking notification as read:", error);
      next(error);
    }
  };

  markAllAsRead = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new CustomError(
          HttpStatusCodes.UNAUTHORIZED,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }

      const role = req.user.role as Roles;
      await this._markNotificationReadUseCase.markAll(req.user.userId, role);

      res.status(HttpStatusCodes.OK).json({
        success: true,
        message: "All notifications marked as read",
      });
    } catch (error) {
      logger.error("Error marking all notifications as read:", error);
      next(error);
    }
  };

  getUnreadCount = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new CustomError(
          HttpStatusCodes.UNAUTHORIZED,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }

      const role = req.user.role as Roles;
      const count = await this._getUnreadNotificationCountUseCase.execute(
        req.user.userId,
        role,
      );

      res.status(HttpStatusCodes.OK).json({
        success: true,
        message: "Unread count fetched",
        data: count,
      });
    } catch (error) {
      logger.error("Error getting unread notification count:", error);
      next(error);
    }
  };
}
