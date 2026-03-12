import Wallet from "../../entities/wallet";

export interface IWalletRepository {
  createWallet(userId: string, session?: any): Promise<Wallet>;
  findByUserId(userId: string): Promise<Wallet | null>;
  updateBalance(
    walletId: string,
    amount: number, // can be positive or negative
    session?: any,
  ): Promise<Wallet>;
  getWallets(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    minBalance?: number;
    maxBalance?: number;
  }): Promise<{ wallets: any[]; totalPages: number; total: number }>;
  getWalletDetails(walletId: string): Promise<any>;
}
