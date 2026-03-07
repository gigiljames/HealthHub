import { IWalletRepository } from "../../../domain/interfaces/repositories/IWalletRepository";
import Wallet from "../../../domain/entities/wallet";

export class GetWalletUseCase {
  constructor(private readonly walletRepository: IWalletRepository) {}

  async execute(userId: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new Error("Wallet not found");
    }
    return wallet;
  }
}
