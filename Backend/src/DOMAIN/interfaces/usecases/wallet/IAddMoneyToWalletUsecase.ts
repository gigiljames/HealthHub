export interface IAddMoneyToWalletUsecase {
  execute(userId: string, amount: number, currency: string): Promise<string>;
}
