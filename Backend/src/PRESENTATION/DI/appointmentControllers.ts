import { AppointmentRepository } from "../../infrastructure/repositories/appointmentRepository";
import { SlotRepository } from "../../infrastructure/repositories/slotRepository";
import { WalletRepository } from "../../infrastructure/repositories/walletRepository";
import { TransactionRepository } from "../../infrastructure/repositories/transactionRepository";
import { GetPatientAppointmentsUseCase } from "../../application/usecases/appointment/GetPatientAppointmentsUseCase";
import { GetPatientAppointmentByIdUseCase } from "../../application/usecases/appointment/GetPatientAppointmentByIdUseCase";
import { PreviewCancelAppointmentUseCase } from "../../application/usecases/appointment/PreviewCancelAppointmentUseCase";
import { CancelAppointmentUseCase } from "../../application/usecases/appointment/CancelAppointmentUseCase";
import { GetDoctorAppointmentsUseCase } from "../../application/usecases/appointment/GetDoctorAppointmentsUseCase";
import { GetDoctorAppointmentByIdUseCase } from "../../application/usecases/appointment/GetDoctorAppointmentByIdUseCase";
import { GetAllAppointmentsUseCase } from "../../application/usecases/appointment/GetAllAppointmentsUseCase";
import { GetAdminAppointmentByIdUseCase } from "../../application/usecases/appointment/GetAdminAppointmentByIdUseCase";
import { PatientAppointmentController } from "../controllers/patient/PatientAppointmentController";
import { DoctorAppointmentController } from "../controllers/doctor/DoctorAppointmentController";
import { AdminAppointmentController } from "../controllers/admin/AdminAppointmentController";
import { AppointmentActionController } from "../controllers/appointment/AppointmentActionController";
import { CancelDoctorAppointmentUseCase } from "../../application/usecases/appointment/CancelDoctorAppointmentUseCase";
import { S3Service } from "../../application/services/s3Service";
import { EmailService } from "../../application/services/emailService";

// Services
const s3Service = new S3Service();
const emailService = new EmailService();

const appointmentRepository = new AppointmentRepository();
const slotRepository = new SlotRepository();
const walletRepository = new WalletRepository();
const transactionRepository = new TransactionRepository();

const getPatientAppointmentsUseCase = new GetPatientAppointmentsUseCase(
  appointmentRepository,
  s3Service,
);
const getPatientAppointmentByIdUseCase = new GetPatientAppointmentByIdUseCase(
  appointmentRepository,
  s3Service,
);
const previewCancelAppointmentUseCase = new PreviewCancelAppointmentUseCase(
  appointmentRepository,
  slotRepository,
);

export const injectedPatientAppointmentController =
  new PatientAppointmentController(
    getPatientAppointmentsUseCase,
    getPatientAppointmentByIdUseCase,
    previewCancelAppointmentUseCase,
  );

const getDoctorAppointmentsUseCase = new GetDoctorAppointmentsUseCase(
  appointmentRepository,
  s3Service,
);
const getDoctorAppointmentByIdUseCase = new GetDoctorAppointmentByIdUseCase(
  appointmentRepository,
);

export const injectedDoctorAppointmentController =
  new DoctorAppointmentController(
    getDoctorAppointmentsUseCase,
    getDoctorAppointmentByIdUseCase,
  );

const getAllAppointmentsUseCase = new GetAllAppointmentsUseCase(
  appointmentRepository,
);
const getAdminAppointmentByIdUseCase = new GetAdminAppointmentByIdUseCase(
  appointmentRepository,
  s3Service,
);

export const injectedAdminAppointmentController =
  new AdminAppointmentController(
    getAllAppointmentsUseCase,
    getAdminAppointmentByIdUseCase,
  );

const cancelPatientAppointmentUseCase = new CancelAppointmentUseCase(
  appointmentRepository,
  slotRepository,
  walletRepository,
  transactionRepository,
);
const cancelDoctorAppointmentUseCase = new CancelDoctorAppointmentUseCase(
  appointmentRepository,
  slotRepository,
  walletRepository,
  transactionRepository,
  emailService,
);

export const injectedAppointmentActionController =
  new AppointmentActionController(
    cancelPatientAppointmentUseCase,
    cancelDoctorAppointmentUseCase,
  );
