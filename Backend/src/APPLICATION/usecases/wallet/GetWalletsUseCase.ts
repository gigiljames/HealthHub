import { IGetWalletsUseCase } from "../../../domain/interfaces/usecases/wallet/IGetWalletsUseCase";
import { IWalletRepository } from "../../../domain/interfaces/repositories/IWalletRepository";

export class GetWalletsUseCase implements IGetWalletsUseCase {
  constructor(private readonly _walletRepository: IWalletRepository) {}

  async execute(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    minBalance?: number;
    maxBalance?: number;
  }): Promise<{ wallets: any[]; totalPages: number; total: number }> {
    return this._walletRepository.getWallets(params);
  }
}
