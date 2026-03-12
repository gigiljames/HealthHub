import { AppointmentRepository } from "../../infrastructure/repositories/appointmentRepository";
import { PayoutRepository } from "../../infrastructure/repositories/payoutRepository";
import { TransactionRepository } from "../../infrastructure/repositories/transactionRepository";
import { WalletRepository } from "../../infrastructure/repositories/walletRepository";
import { MarkAppointmentCompletedUseCase } from "../../application/usecases/appointment/MarkAppointmentCompletedUseCase";
import { ProcessDoctorPayoutsUseCase } from "../../application/usecases/payout/ProcessDoctorPayoutsUseCase";
import { GetDoctorPayoutsUseCase } from "../../application/usecases/payout/GetDoctorPayoutsUseCase";
import { GetAdminPayoutsUseCase } from "../../application/usecases/payout/GetAdminPayoutsUseCase";
import { GetPayoutDetailsUseCase } from "../../application/usecases/payout/GetPayoutDetailsUseCase";
import { DoctorPayoutController } from "../controllers/DoctorPayoutController";
import { AdminPayoutController } from "../controllers/AdminPayoutController";
import { WeeklyPayoutCron } from "../../infrastructure/cron/WeeklyPayoutCron";

// Repositories
const appointmentRepository = new AppointmentRepository();
const payoutRepository = new PayoutRepository();
const transactionRepository = new TransactionRepository();
const walletRepository = new WalletRepository();

// Use Cases
const markAppointmentCompletedUseCase = new MarkAppointmentCompletedUseCase(
  appointmentRepository,
);
const processDoctorPayoutsUseCase = new ProcessDoctorPayoutsUseCase(
  appointmentRepository,
  payoutRepository,
  transactionRepository,
  walletRepository,
);
const getDoctorPayoutsUseCase = new GetDoctorPayoutsUseCase(payoutRepository);
const getAdminPayoutsUseCase = new GetAdminPayoutsUseCase(payoutRepository);
const getPayoutDetailsUseCase = new GetPayoutDetailsUseCase(payoutRepository);

// Controllers
export const injectedDoctorPayoutController = new DoctorPayoutController(
  markAppointmentCompletedUseCase,
  getDoctorPayoutsUseCase,
  getPayoutDetailsUseCase,
);

export const injectedAdminPayoutController = new AdminPayoutController(
  getAdminPayoutsUseCase,
  getPayoutDetailsUseCase,
);

// Cron Jobs
export const weeklyPayoutCron = new WeeklyPayoutCron(
  processDoctorPayoutsUseCase,
);
