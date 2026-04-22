import { AuthRepository } from "../../infrastructure/repositories/authRepository";
import { DoctorProfileRepository } from "../../infrastructure/repositories/doctorProfileRepository";
import { UserProfileRepository } from "../../infrastructure/repositories/userProfileRepository";
import { AppointmentRepository } from "../../infrastructure/repositories/appointmentRepository";
import { TransactionRepository } from "../../infrastructure/repositories/transactionRepository";
import { PayoutRepository } from "../../infrastructure/repositories/payoutRepository";
import { WalletRepository } from "../../infrastructure/repositories/walletRepository";
import { OrganizationRepository } from "../../infrastructure/repositories/organizationRepository";
import { GetAdminDashboardStatsUseCase } from "../../application/usecases/admin/dashboard/GetAdminDashboardStatsUseCase";
import { AdminDashboardController } from "../controllers/admin/AdminDashboardController";

// Repositories
const authRepository = new AuthRepository();
const doctorProfileRepository = new DoctorProfileRepository();
const userProfileRepository = new UserProfileRepository();
const appointmentRepository = new AppointmentRepository();
const transactionRepository = new TransactionRepository();
const payoutRepository = new PayoutRepository();
const walletRepository = new WalletRepository();
const organizationRepository = new OrganizationRepository();

// Usecases
const getAdminDashboardStatsUseCase = new GetAdminDashboardStatsUseCase(
  authRepository,
  doctorProfileRepository,
  userProfileRepository,
  appointmentRepository,
  transactionRepository,
  payoutRepository,
  walletRepository,
  organizationRepository,
);

// Controller
export const injectedAdminDashboardController = new AdminDashboardController(
  getAdminDashboardStatsUseCase,
);
