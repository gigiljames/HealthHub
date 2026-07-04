import { Router } from "express";
import { injectedNotificationController } from "../../DI/notification";
import { authMiddleware } from "../../middlewares/authMiddleware";
import TokenService from "../../../application/services/tokenService";
import { AuthRepository } from "../../../infrastructure/repositories/authRepository";
import { Roles } from "../../../domain/enums/roles";

export class NotificationRoute {
  public notificationRouter = Router();

  constructor() {
    const tokenService = new TokenService();
    const authRepository = new AuthRepository();

    // All notification routes require authentication
    this.notificationRouter.use(
      authMiddleware(
        [Roles.USER, Roles.DOCTOR, Roles.ADMIN],
        tokenService,
        authRepository,
      ),
    );

    this.notificationRouter.get("/", (req, res, next) => {
      injectedNotificationController.getNotifications(req, res, next);
    });

    this.notificationRouter.get("/unread-count", (req, res, next) => {
      injectedNotificationController.getUnreadCount(req, res, next);
    });

    this.notificationRouter.patch("/mark-all-read", (req, res, next) => {
      injectedNotificationController.markAllAsRead(req, res, next);
    });

    this.notificationRouter.patch("/:id/read", (req, res, next) => {
      injectedNotificationController.markAsRead(req, res, next);
    });
  }
}
