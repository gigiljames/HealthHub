import Wallet from "../../../entities/wallet";

export interface IGetWalletUsecase {
  execute(userId: string): Promise<Wallet>;
}
