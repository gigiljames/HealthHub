import { WalletDetailsDTO } from "../../../../application/DTOs/wallet/walletDTO";

export interface IGetWalletsUseCase {
  execute(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    minBalance?: number;
    maxBalance?: number;
  }): Promise<{
    wallets: WalletDetailsDTO[];
    totalPages: number;
    total: number;
  }>;
}
