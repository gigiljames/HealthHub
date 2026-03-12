import { AppointmentRepository } from "../../infrastructure/repositories/appointmentRepository";
import { PayoutRepository } from "../../infrastructure/repositories/payoutRepository";
import { TransactionRepository } from "../../infrastructure/repositories/transactionRepository";
import { WalletRepository } from "../../infrastructure/repositories/walletRepository";
import { MarkAppointmentCompletedUseCase } from "../../application/usecases/appointment/MarkAppointmentCompletedUseCase";
import { ProcessDoctorPayoutsUseCase } from "../../application/usecases/payout/ProcessDoctorPayoutsUseCase";
import { DoctorPayoutController } from "../controllers/DoctorPayoutController";
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

// Controllers
export const injectedPayoutController = new DoctorPayoutController(
  markAppointmentCompletedUseCase,
);

// Cron Jobs
export const weeklyPayoutCron = new WeeklyPayoutCron(
  processDoctorPayoutsUseCase,
);
