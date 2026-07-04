import { IGetWalletTransactionsUseCase } from "../../../domain/interfaces/usecases/transaction/IGetWalletTransactionsUseCase";
import {
  ITransactionRepository,
  PaginatedTransactions,
  TransactionFilterParams,
} from "../../../domain/interfaces/repositories/ITransactionRepository";

export class GetWalletTransactionsUseCase implements IGetWalletTransactionsUseCase {
  constructor(
    private readonly _transactionRepository: ITransactionRepository,
  ) {}

  async execute(
    walletId: string,
    filters: TransactionFilterParams,
  ): Promise<PaginatedTransactions> {
    return this._transactionRepository.getWalletTransactions(walletId, filters);
  }
}
