import { ConsultationController } from "../controllers/consultation/ConsultationController";
import { JoinConsultationUseCase } from "../../application/usecases/consultation/joinConsultationUseCase";
import { EndConsultationUseCase } from "../../application/usecases/consultation/endConsultationUseCase";
import { ConsultationRepository } from "../../infrastructure/repositories/consultationRepository";
import { AppointmentRepository } from "../../infrastructure/repositories/appointmentRepository";
import { socketService } from "../../infrastructure/socket/SocketIOService";
import { EmailService } from "../../application/services/emailService";
import { CreateNotificationUseCase } from "../../application/usecases/notification/CreateNotificationUseCase";
import { NotificationRepository } from "../../infrastructure/repositories/notificationRepository";
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
import { VerifyPrescriptionUseCase } from "../../application/usecases/consultation/VerifyPrescriptionUseCase";
import { RevokePrescriptionUseCase } from "../../application/usecases/consultation/RevokePrescriptionUseCase";
import { ConsultationReportController } from "../controllers/consultation/ConsultationReportController";
import { PrescriptionController } from "../controllers/consultation/PrescriptionController";
import { DoctorProfileRepository } from "../../infrastructure/repositories/doctorProfileRepository";
import { MessageRepository } from "../../infrastructure/repositories/MessageRepository";
import { ChatRepository } from "../../infrastructure/repositories/ChatRepository";
import { SlotRepository } from "../../infrastructure/repositories/slotRepository";
import { GetChatsUseCase } from "../../application/usecases/consultation/GetChatsUseCase";
import { GetMessagesUseCase } from "../../application/usecases/consultation/GetMessagesUseCase";
import { SendMessageUseCase } from "../../application/usecases/consultation/SendMessageUseCase";
import { EditMessageUseCase } from "../../application/usecases/consultation/EditMessageUseCase";
import { DeleteMessageUseCase } from "../../application/usecases/consultation/DeleteMessageUseCase";
import { MarkMessageAsReadUseCase } from "../../application/usecases/consultation/MarkMessageAsReadUseCase";
import { GetChatUploadUrlUseCase } from "../../application/usecases/consultation/GetChatUploadUrlUseCase";
import { GetChatAccessUrlUseCase } from "../../application/usecases/consultation/GetChatAccessUrlUseCase";
import { S3Service } from "../../application/services/s3Service";
import { PatientMessageController } from "../controllers/patient/PatientMessageController";
import { DoctorMessageController } from "../controllers/doctor/DoctorMessageController";

// Repositories
const consultationRepository = new ConsultationRepository();
const appointmentRepository = new AppointmentRepository();
const notificationRepository = new NotificationRepository();
const reportRepository = new ConsultationReportRepository();
const prescriptionRepository = new PrescriptionRepository();
const slotRepository = new SlotRepository();

// Services
const emailService = new EmailService();

// Usecases
const createNotificationUseCase = new CreateNotificationUseCase(
  notificationRepository,
  socketService,
);
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
const createConsultationReportUseCase = new CreateConsultationReportUseCase(
  reportRepository,
  appointmentRepository,
);
const getConsultationReportByAppointmentIdUseCase =
  new GetConsultationReportByAppointmentIdUseCase(reportRepository);
const getConsultationReportByIdUseCase = new GetConsultationReportByIdUseCase(
  reportRepository,
);
const listConsultationReportsUseCase = new ListConsultationReportsUseCase(
  reportRepository,
);

// Prescriptions usecases
const doctorProfileRepository = new DoctorProfileRepository();
const s3Service = new S3Service();
const createPrescriptionUseCase = new CreatePrescriptionUseCase(
  prescriptionRepository,
  appointmentRepository,
  doctorProfileRepository,
);

const getPrescriptionByAppointmentIdUseCase =
  new GetPrescriptionByAppointmentIdUseCase(prescriptionRepository, s3Service);
const getPrescriptionByIdUseCase = new GetPrescriptionByIdUseCase(
  prescriptionRepository,
  s3Service,
);
const listPrescriptionsUseCase = new ListPrescriptionsUseCase(
  prescriptionRepository,
);
const verifyPrescriptionUseCase = new VerifyPrescriptionUseCase(
  prescriptionRepository,
  doctorProfileRepository,
  s3Service,
);
const revokePrescriptionUseCase = new RevokePrescriptionUseCase(
  prescriptionRepository,
);

// Message usecases
const messageRepository = new MessageRepository();
const chatRepository = new ChatRepository();
const getChatsUseCase = new GetChatsUseCase(chatRepository);
const getMessagesUseCase = new GetMessagesUseCase(
  messageRepository,
  consultationRepository,
  appointmentRepository,
  slotRepository,
);
const sendMessageUseCase = new SendMessageUseCase(
  messageRepository,
  consultationRepository,
  appointmentRepository,
  slotRepository,
);
const editMessageUseCase = new EditMessageUseCase(messageRepository);
const deleteMessageUseCase = new DeleteMessageUseCase(messageRepository);
const markMessageAsReadUseCase = new MarkMessageAsReadUseCase(
  messageRepository,
);
const getChatUploadUrlUseCase = new GetChatUploadUrlUseCase(
  s3Service,
  consultationRepository,
  appointmentRepository,
  slotRepository,
  messageRepository,
);
const getChatAccessUrlUseCase = new GetChatAccessUrlUseCase(
  messageRepository,
  s3Service,
);

// Controllers
export const injectedConsultationController = new ConsultationController(
  joinConsultationUseCase,
  endConsultationUseCase,
);

export const injectedConsultationReportController =
  new ConsultationReportController(
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
  verifyPrescriptionUseCase,
  revokePrescriptionUseCase,
  appointmentRepository,
);

export const injectedPatientMessageController = new PatientMessageController(
  getMessagesUseCase,
  sendMessageUseCase,
  editMessageUseCase,
  deleteMessageUseCase,
  markMessageAsReadUseCase,
  getChatUploadUrlUseCase,
  getChatAccessUrlUseCase,
  getChatsUseCase,
);

export const injectedDoctorMessageController = new DoctorMessageController(
  getMessagesUseCase,
  sendMessageUseCase,
  editMessageUseCase,
  deleteMessageUseCase,
  markMessageAsReadUseCase,
  getChatUploadUrlUseCase,
  getChatAccessUrlUseCase,
  getChatsUseCase,
);
