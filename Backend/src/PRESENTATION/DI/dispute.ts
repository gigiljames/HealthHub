import { DisputeRepository } from "../../infrastructure/repositories/disputeRepository";
import { AppointmentRepository } from "../../infrastructure/repositories/appointmentRepository";
import { SlotRepository } from "../../infrastructure/repositories/slotRepository";
import { WalletRepository } from "../../infrastructure/repositories/walletRepository";
import { TransactionRepository } from "../../infrastructure/repositories/transactionRepository";
import { DoctorProfileRepository } from "../../infrastructure/repositories/doctorProfileRepository";
import { ConsultationRepository } from "../../infrastructure/repositories/consultationRepository";
import { MessageRepository } from "../../infrastructure/repositories/MessageRepository";
import { ConsultationReportRepository } from "../../infrastructure/repositories/consultationReportRepository";

import { S3Service } from "../../application/services/s3Service";
import { EmailService } from "../../application/services/emailService";

import { SubmitDisputeUseCase } from "../../application/usecases/disputes/SubmitDisputeUseCase";
import { GetAdminDisputesUseCase } from "../../application/usecases/disputes/GetAdminDisputesUseCase";
import { GetDisputeDetailsUseCase } from "../../application/usecases/disputes/GetDisputeDetailsUseCase";
import { UpdateDisputeStatusUseCase } from "../../application/usecases/disputes/UpdateDisputeStatusUseCase";
import { EnforceModerationActionUseCase } from "../../application/usecases/disputes/EnforceModerationActionUseCase";
import { createNotificationUseCase } from "./notification";

import { DisputeController } from "../controllers/dispute/disputeController";

// Repositories
const disputeRepository = new DisputeRepository();
const appointmentRepository = new AppointmentRepository();
const slotRepository = new SlotRepository();
const walletRepository = new WalletRepository();
const transactionRepository = new TransactionRepository();
const doctorProfileRepository = new DoctorProfileRepository();
const consultationRepository = new ConsultationRepository();
const messageRepository = new MessageRepository();
const consultationReportRepository = new ConsultationReportRepository();

// Services
const s3Service = new S3Service();
const emailService = new EmailService();

// Use Cases
const submitDisputeUseCase = new SubmitDisputeUseCase(
  disputeRepository,
  appointmentRepository,
);

const getAdminDisputesUseCase = new GetAdminDisputesUseCase(disputeRepository);

const getDisputeDetailsUseCase = new GetDisputeDetailsUseCase(
  disputeRepository,
  appointmentRepository,
  consultationRepository,
  messageRepository,
  consultationReportRepository,
  s3Service,
);

const updateDisputeStatusUseCase = new UpdateDisputeStatusUseCase(
  disputeRepository,
  emailService,
);

const enforceModerationActionUseCase = new EnforceModerationActionUseCase(
  appointmentRepository,
  slotRepository,
  walletRepository,
  transactionRepository,
  doctorProfileRepository,
  emailService,
  createNotificationUseCase,
);

// Controller
export const injectedDisputeController = new DisputeController(
  submitDisputeUseCase,
  getAdminDisputesUseCase,
  getDisputeDetailsUseCase,
  updateDisputeStatusUseCase,
  enforceModerationActionUseCase,
  s3Service,
  disputeRepository,
);
