export interface IGetTransactionDetailsUseCase {
  execute(transactionId: string): Promise<any>;
}
