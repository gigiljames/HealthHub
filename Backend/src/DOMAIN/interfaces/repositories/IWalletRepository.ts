import Wallet from "../../entities/wallet";

export interface IWalletRepository {
  createWallet(userId: string, session?: any): Promise<Wallet>;
  findByUserId(userId: string): Promise<Wallet | null>;
  updateBalance(
    walletId: string,
    amount: number, // can be positive or negative
    session?: any,
  ): Promise<Wallet>;
}
