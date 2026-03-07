import { SlotRepository } from "../../infrastructure/repositories/slotRepository";
import { AppointmentRepository } from "../../infrastructure/repositories/appointmentRepository";
import { TransactionRepository } from "../../infrastructure/repositories/transactionRepository";
import { WalletRepository } from "../../infrastructure/repositories/walletRepository";
import { DoctorProfileRepository } from "../../infrastructure/repositories/doctorProfileRepository";
import { LockSlotUseCase } from "../../application/usecases/booking/LockSlotUseCase";
import { BookAppointmentUseCase } from "../../application/usecases/booking/BookAppointmentUseCase";
import { GetAppointmentSummaryUseCase } from "../../application/usecases/booking/GetAppointmentSummaryUseCase";
import { PatientBookingController } from "../controllers/PatientBookingController";
import { StripePaymentService } from "../../application/services/stripePaymentService";
import { S3Service } from "../../application/services/s3Service";

// Repositories
const slotRepository = new SlotRepository();
const appointmentRepository = new AppointmentRepository();
const transactionRepository = new TransactionRepository();
const walletRepository = new WalletRepository();
const doctorProfileRepository = new DoctorProfileRepository();

// Services
const s3Service = new S3Service();
const stripePaymentService = new StripePaymentService();

// Use Cases
const lockSlotUseCase = new LockSlotUseCase(slotRepository);
const bookAppointmentUseCase = new BookAppointmentUseCase(
  slotRepository,
  appointmentRepository,
  stripePaymentService,
  transactionRepository,
  walletRepository,
);
const getAppointmentSummaryUseCase = new GetAppointmentSummaryUseCase(
  slotRepository,
  doctorProfileRepository,
  s3Service,
);

// Controller
export const injectedBookingController = new PatientBookingController(
  lockSlotUseCase,
  bookAppointmentUseCase,
  getAppointmentSummaryUseCase,
);
