import { WalletRepository } from "../../infrastructure/repositories/walletRepository";
import { TransactionRepository } from "../../infrastructure/repositories/transactionRepository";
import { StripePaymentService } from "../../application/services/stripePaymentService";
import { GetWalletUseCase } from "../../application/usecases/wallet/GetWalletUseCase";
import { AddMoneyToWalletUseCase } from "../../application/usecases/wallet/AddMoneyToWalletUseCase";
import { WalletController } from "../controllers/wallet/WalletController";

const walletRepository = new WalletRepository();
const transactionRepository = new TransactionRepository();
const stripePaymentService = new StripePaymentService();

const getWalletUseCase = new GetWalletUseCase(walletRepository);
const addMoneyToWalletUseCase = new AddMoneyToWalletUseCase(
  walletRepository,
  transactionRepository,
  stripePaymentService,
);

export const injectedWalletController = new WalletController(
  getWalletUseCase,
  addMoneyToWalletUseCase,
);
