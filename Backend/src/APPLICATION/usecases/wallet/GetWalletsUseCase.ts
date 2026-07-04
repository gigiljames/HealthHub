import { IGetWalletsUseCase } from "../../../domain/interfaces/usecases/wallet/IGetWalletsUseCase";
import { IWalletRepository } from "../../../domain/interfaces/repositories/IWalletRepository";
import { WalletDetailsDTO } from "../../DTOs/wallet/walletDTO";

export class GetWalletsUseCase implements IGetWalletsUseCase {
  constructor(private readonly _walletRepository: IWalletRepository) {}

  async execute(params: {
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
  }> {
    return this._walletRepository.getWallets(params);
  }
}
