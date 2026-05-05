import { NotificationRepository } from "../../infrastructure/repositories/notificationRepository";
import { GetUserNotificationsUseCase } from "../../application/usecases/notification/GetUserNotificationsUseCase";
import { MarkNotificationReadUseCase } from "../../application/usecases/notification/MarkNotificationReadUseCase";
import { GetUnreadNotificationCountUseCase } from "../../application/usecases/notification/GetUnreadNotificationCountUseCase";
import { NotificationController } from "../controllers/notification/NotificationController";
import { CreateNotificationUseCase } from "../../application/usecases/notification/CreateNotificationUseCase";
import { NotificationCronService } from "../../infrastructure/cron/notificationCron";
import { socketService } from "../../infrastructure/socket/SocketIOService";
import { EmailService } from "../../application/services/emailService";
import { AppointmentRepository } from "../../infrastructure/repositories/appointmentRepository";

const notificationRepository = new NotificationRepository();

const getUserNotificationsUseCase = new GetUserNotificationsUseCase(
  notificationRepository,
);

const markNotificationReadUseCase = new MarkNotificationReadUseCase(
  notificationRepository,
);

const getUnreadNotificationCountUseCase = new GetUnreadNotificationCountUseCase(
  notificationRepository,
);

export const injectedNotificationController = new NotificationController(
  getUserNotificationsUseCase,
  markNotificationReadUseCase,
  getUnreadNotificationCountUseCase,
);

const appointmentRepository = new AppointmentRepository();
const emailService = new EmailService();

export const createNotificationUseCase = new CreateNotificationUseCase(
  notificationRepository,
  socketService,
);

export const notificationCronService = new NotificationCronService(
  appointmentRepository,
  emailService,
  createNotificationUseCase,
);
