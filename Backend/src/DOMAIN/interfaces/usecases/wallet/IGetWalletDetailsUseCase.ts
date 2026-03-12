export interface IGetWalletDetailsUseCase {
  execute(walletId: string): Promise<any>;
}
