import { WalletWithUserAgg } from "../../../domain/types/repositoryTypes";
import Wallet from "../../entities/wallet";

export interface IWalletRepository {
  createWallet(userId: string, session?: unknown): Promise<Wallet>;
  findByUserId(userId: string): Promise<Wallet | null>;
  updateBalance(
    walletId: string,
    amount: number, // can be positive or negative
    session?: unknown,
  ): Promise<Wallet>;
  getWallets(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    minBalance?: number;
    maxBalance?: number;
  }): Promise<{
    wallets: WalletWithUserAgg[];
    totalPages: number;
    total: number;
  }>;
  getWalletDetails(walletId: string): Promise<WalletWithUserAgg>;
}
