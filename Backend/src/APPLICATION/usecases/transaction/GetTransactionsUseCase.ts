import {
  ITransactionRepository,
  TransactionFilterParams,
  PaginatedTransactions,
} from "../../../domain/interfaces/repositories/ITransactionRepository";
import { IGetTransactionsUseCase } from "../../../domain/interfaces/usecases/transaction/IGetTransactionsUseCase";

export class GetTransactionsUseCase implements IGetTransactionsUseCase {
  constructor(private readonly transactionRepository: ITransactionRepository) {}

  async getUserTransactions(
    userId: string,
    filters: TransactionFilterParams,
  ): Promise<PaginatedTransactions> {
    return this.transactionRepository.getTransactionsByUserId(userId, filters);
  }

  async getDoctorTransactions(
    doctorId: string,
    filters: TransactionFilterParams,
  ): Promise<PaginatedTransactions> {
    return this.transactionRepository.getTransactionsByDoctorId(
      doctorId,
      filters,
    );
  }

  async getAllTransactions(
    filters: TransactionFilterParams,
  ): Promise<PaginatedTransactions> {
    return this.transactionRepository.getAllTransactions(filters);
  }

  async execute(
    filters: TransactionFilterParams,
  ): Promise<PaginatedTransactions> {
    return this.transactionRepository.getAllTransactions(filters);
  }
}
