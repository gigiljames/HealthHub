import { ConsultationController } from "../controllers/consultation/ConsultationController";
import { JoinConsultationUseCase } from "../../application/usecases/consultation/joinConsultationUseCase";
import { EndConsultationUseCase } from "../../application/usecases/consultation/endConsultationUseCase";
import { ConsultationRepository } from "../../infrastructure/repositories/consultationRepository";
import { AppointmentRepository } from "../../infrastructure/repositories/appointmentRepository";
import { socketService } from "../../infrastructure/socket/SocketIOService";
import { EmailService } from "../../application/services/emailService";
import { CreateNotificationUseCase } from "../../application/usecases/notification/CreateNotificationUseCase";
import { NotificationRepository } from "../../infrastructure/repositories/notificationRepository";

// Repositories
const consultationRepository = new ConsultationRepository();
const appointmentRepository = new AppointmentRepository();
const notificationRepository = new NotificationRepository();

// Services
const emailService = new EmailService();

// Usecases
const createNotificationUseCase = new CreateNotificationUseCase(notificationRepository, socketService);
const joinConsultationUseCase = new JoinConsultationUseCase(
  consultationRepository,
  appointmentRepository,
  socketService,
  emailService,
  createNotificationUseCase,
);
const endConsultationUseCase = new EndConsultationUseCase(
  consultationRepository,
  appointmentRepository,
  socketService,
);

// Controllers
export const injectedConsultationController = new ConsultationController(
  joinConsultationUseCase,
  endConsultationUseCase,
);
