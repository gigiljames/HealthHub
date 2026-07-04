import { TransactionDetailsDTO } from "../../../../application/DTOs/transaction/transactionDTO";

export interface IGetTransactionDetailsUseCase {
  execute(transactionId: string): Promise<TransactionDetailsDTO>;
}
