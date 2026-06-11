import { ConsultationController } from "../controllers/consultation/ConsultationController";
import { JoinConsultationUseCase } from "../../application/usecases/consultation/joinConsultationUseCase";
import { EndConsultationUseCase } from "../../application/usecases/consultation/endConsultationUseCase";
import { ConsultationRepository } from "../../infrastructure/repositories/consultationRepository";
import { AppointmentRepository } from "../../infrastructure/repositories/appointmentRepository";
import { socketService } from "../../infrastructure/socket/SocketIOService";
import { EmailService } from "../../application/services/emailService";
import { CreateNotificationUseCase } from "../../application/usecases/notification/CreateNotificationUseCase";
import { NotificationRepository } from "../../infrastructure/repositories/notificationRepository";

// Consultation Report & Prescription additions
import { ConsultationReportRepository } from "../../infrastructure/repositories/consultationReportRepository";
import { PrescriptionRepository } from "../../infrastructure/repositories/prescriptionRepository";
import { CreateConsultationReportUseCase } from "../../application/usecases/consultation/CreateConsultationReportUseCase";
import { GetConsultationReportByAppointmentIdUseCase } from "../../application/usecases/consultation/GetConsultationReportByAppointmentIdUseCase";
import { GetConsultationReportByIdUseCase } from "../../application/usecases/consultation/GetConsultationReportByIdUseCase";
import { ListConsultationReportsUseCase } from "../../application/usecases/consultation/ListConsultationReportsUseCase";
import { CreatePrescriptionUseCase } from "../../application/usecases/consultation/CreatePrescriptionUseCase";
import { GetPrescriptionByAppointmentIdUseCase } from "../../application/usecases/consultation/GetPrescriptionByAppointmentIdUseCase";
import { GetPrescriptionByIdUseCase } from "../../application/usecases/consultation/GetPrescriptionByIdUseCase";
import { ListPrescriptionsUseCase } from "../../application/usecases/consultation/ListPrescriptionsUseCase";
import { ConsultationReportController } from "../controllers/consultation/ConsultationReportController";
import { PrescriptionController } from "../controllers/consultation/PrescriptionController";

// Message (Chat) additions
import { MessageRepository } from "../../infrastructure/repositories/MessageRepository";
import { GetMessagesUseCase } from "../../application/usecases/consultation/GetMessagesUseCase";
import { SendMessageUseCase } from "../../application/usecases/consultation/SendMessageUseCase";
import { EditMessageUseCase } from "../../application/usecases/consultation/EditMessageUseCase";
import { DeleteMessageUseCase } from "../../application/usecases/consultation/DeleteMessageUseCase";
import { MarkMessageAsReadUseCase } from "../../application/usecases/consultation/MarkMessageAsReadUseCase";
import { PatientMessageController } from "../controllers/patient/PatientMessageController";
import { DoctorMessageController } from "../controllers/doctor/DoctorMessageController";

// Repositories
const consultationRepository = new ConsultationRepository();
const appointmentRepository = new AppointmentRepository();
const notificationRepository = new NotificationRepository();
const reportRepository = new ConsultationReportRepository();
const prescriptionRepository = new PrescriptionRepository();

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

// Reports usecases
const createConsultationReportUseCase = new CreateConsultationReportUseCase(reportRepository, appointmentRepository);
const getConsultationReportByAppointmentIdUseCase = new GetConsultationReportByAppointmentIdUseCase(reportRepository);
const getConsultationReportByIdUseCase = new GetConsultationReportByIdUseCase(reportRepository);
const listConsultationReportsUseCase = new ListConsultationReportsUseCase(reportRepository);

// Prescriptions usecases
const createPrescriptionUseCase = new CreatePrescriptionUseCase(prescriptionRepository, appointmentRepository);
const getPrescriptionByAppointmentIdUseCase = new GetPrescriptionByAppointmentIdUseCase(prescriptionRepository);
const getPrescriptionByIdUseCase = new GetPrescriptionByIdUseCase(prescriptionRepository);
const listPrescriptionsUseCase = new ListPrescriptionsUseCase(prescriptionRepository);

// Controllers
export const injectedConsultationController = new ConsultationController(
  joinConsultationUseCase,
  endConsultationUseCase,
);

export const injectedConsultationReportController = new ConsultationReportController(
  createConsultationReportUseCase,
  getConsultationReportByAppointmentIdUseCase,
  getConsultationReportByIdUseCase,
  listConsultationReportsUseCase,
  appointmentRepository,
);

export const injectedPrescriptionController = new PrescriptionController(
  createPrescriptionUseCase,
  getPrescriptionByAppointmentIdUseCase,
  getPrescriptionByIdUseCase,
  listPrescriptionsUseCase,
  appointmentRepository,
);

// Message instantiations
const messageRepository = new MessageRepository();
const getMessagesUseCase = new GetMessagesUseCase(messageRepository);
const sendMessageUseCase = new SendMessageUseCase(messageRepository);
const editMessageUseCase = new EditMessageUseCase(messageRepository);
const deleteMessageUseCase = new DeleteMessageUseCase(messageRepository);
const markMessageAsReadUseCase = new MarkMessageAsReadUseCase(messageRepository);

export const injectedPatientMessageController = new PatientMessageController(
  getMessagesUseCase,
  sendMessageUseCase,
  editMessageUseCase,
  deleteMessageUseCase,
  markMessageAsReadUseCase,
);

export const injectedDoctorMessageController = new DoctorMessageController(
  getMessagesUseCase,
  sendMessageUseCase,
  editMessageUseCase,
  deleteMessageUseCase,
  markMessageAsReadUseCase,
);
