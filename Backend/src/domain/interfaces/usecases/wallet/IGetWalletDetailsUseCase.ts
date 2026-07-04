import { WalletDetailsDTO } from "../../../../application/DTOs/wallet/walletDTO";

export interface IGetWalletDetailsUseCase {
  execute(walletId: string): Promise<WalletDetailsDTO>;
}
