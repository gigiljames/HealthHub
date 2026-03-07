import {
  ITransactionRepository,
  TransactionFilterParams,
  PaginatedTransactions,
} from "../../../domain/interfaces/repositories/ITransactionRepository";

export class GetTransactionsUseCase {
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
}
