import {
  PaginatedTransactions,
  TransactionFilterParams,
} from "../../repositories/ITransactionRepository";

export interface IGetWalletTransactionsUseCase {
  execute(
    walletId: string,
    filters: TransactionFilterParams,
  ): Promise<PaginatedTransactions>;
}
