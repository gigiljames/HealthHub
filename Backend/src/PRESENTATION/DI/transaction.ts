import { TransactionRepository } from "../../infrastructure/repositories/transactionRepository";
import { GetTransactionsUseCase } from "../../application/usecases/transaction/GetTransactionsUseCase";
import { TransactionController } from "../controllers/transaction/TransactionController";

const transactionRepository = new TransactionRepository();

const getTransactionsUseCase = new GetTransactionsUseCase(
  transactionRepository,
);

export const injectedTransactionController = new TransactionController(
  getTransactionsUseCase,
);
