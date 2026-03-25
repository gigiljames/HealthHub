import { IWalletRepository } from "../../../domain/interfaces/repositories/IWalletRepository";
import Wallet from "../../../domain/entities/wallet";
import { IGetWalletUsecase } from "../../../domain/interfaces/usecases/wallet/IGetWalletUsecase";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";

export class GetWalletUseCase implements IGetWalletUsecase {
  constructor(private readonly walletRepository: IWalletRepository) {}

  async execute(userId: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.WALLET.NOT_FOUND,
      );
    }
    return wallet;
  }
}
