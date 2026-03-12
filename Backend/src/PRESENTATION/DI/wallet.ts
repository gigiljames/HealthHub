import { WalletRepository } from "../../infrastructure/repositories/walletRepository";
import { TransactionRepository } from "../../infrastructure/repositories/transactionRepository";
import { StripePaymentService } from "../../application/services/stripePaymentService";
import { GetWalletUseCase } from "../../application/usecases/wallet/GetWalletUseCase";
import { AddMoneyToWalletUseCase } from "../../application/usecases/wallet/AddMoneyToWalletUseCase";
import { WalletController } from "../controllers/wallet/WalletController";
import { GetWalletsUseCase } from "../../application/usecases/wallet/GetWalletsUseCase";
import { GetWalletDetailsUseCase } from "../../application/usecases/wallet/GetWalletDetailsUseCase";
import { GetWalletTransactionsUseCase } from "../../application/usecases/transaction/GetWalletTransactionsUseCase";
import { AdminWalletController } from "../controllers/wallet/AdminWalletController";
import { UserProfileRepository } from "../../infrastructure/repositories/userProfileRepository";
import { DoctorProfileRepository } from "../../infrastructure/repositories/doctorProfileRepository";
import { S3Service } from "../../application/services/s3Service";

// Repositories
const walletRepository = new WalletRepository();
const transactionRepository = new TransactionRepository();
const userProfileRepository = new UserProfileRepository();
const doctorProfileRepository = new DoctorProfileRepository();

// Services
const stripePaymentService = new StripePaymentService();
const s3Service = new S3Service();

// Use Cases
const getWalletUseCase = new GetWalletUseCase(walletRepository);
const addMoneyToWalletUseCase = new AddMoneyToWalletUseCase(
  walletRepository,
  transactionRepository,
  stripePaymentService,
);
const getWalletsUseCase = new GetWalletsUseCase(walletRepository);
const getWalletDetailsUseCase = new GetWalletDetailsUseCase(
  walletRepository,
  userProfileRepository,
  doctorProfileRepository,
  s3Service,
);
const getWalletTransactionsUseCase = new GetWalletTransactionsUseCase(
  transactionRepository,
);

// Controllers
export const injectedWalletController = new WalletController(
  getWalletUseCase,
  addMoneyToWalletUseCase,
);
export const injectedAdminWalletController = new AdminWalletController(
  getWalletsUseCase,
  getWalletDetailsUseCase,
  getWalletTransactionsUseCase,
);
