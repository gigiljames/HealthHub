import { TransactionRepository } from "../../infrastructure/repositories/transactionRepository";
import { GetTransactionsUseCase } from "../../application/usecases/transaction/GetTransactionsUseCase";
import { TransactionController } from "../controllers/transaction/TransactionController";
import { AdminTransactionController } from "../controllers/transaction/AdminTransactionController";
import { GetTransactionDetailsUseCase } from "../../application/usecases/transaction/GetTransactionDetailsUseCase";
import { AuthRepository } from "../../infrastructure/repositories/authRepository";
import { S3Service } from "../../application/services/s3Service";

// Repositories
const transactionRepository = new TransactionRepository();
const authRepository = new AuthRepository();

// Services
const s3Service = new S3Service();

// Usecases
const getTransactionsUseCase = new GetTransactionsUseCase(
  transactionRepository,
);
const getTransactionDetailsUseCase = new GetTransactionDetailsUseCase(
  transactionRepository,
  authRepository,
  s3Service,
);

// Controllers
export const injectedTransactionController = new TransactionController(
  getTransactionsUseCase,
);
export const injectedAdminTransactionController =
  new AdminTransactionController(
    getTransactionsUseCase,
    getTransactionDetailsUseCase,
  );
