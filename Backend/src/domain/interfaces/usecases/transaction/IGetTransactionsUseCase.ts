import {
  TransactionFilterParams,
  PaginatedTransactions,
} from "../../repositories/ITransactionRepository";

export interface IGetTransactionsUseCase {
  execute(filters: TransactionFilterParams): Promise<PaginatedTransactions>;
}
