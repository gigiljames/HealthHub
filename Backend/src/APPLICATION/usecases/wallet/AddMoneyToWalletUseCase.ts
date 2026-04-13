import { ITransactionRepository } from "../../../domain/interfaces/repositories/ITransactionRepository";
import { IWalletRepository } from "../../../domain/interfaces/repositories/IWalletRepository";
import { IPaymentService } from "../../../domain/interfaces/services/IPaymentService";
import { TransactionDirection } from "../../../domain/enums/transactionDirection";
import { TransactionType } from "../../../domain/enums/transactionType";
import { TransactionSource } from "../../../domain/enums/transactionSource";
import { PaymentStatus } from "../../../domain/enums/paymentStatus";
import { IAddMoneyToWalletUsecase } from "../../../domain/interfaces/usecases/wallet/IAddMoneyToWalletUsecase";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";

export class AddMoneyToWalletUseCase implements IAddMoneyToWalletUsecase {
  constructor(
    private readonly _walletRepository: IWalletRepository,
    private readonly _transactionRepository: ITransactionRepository,
    private readonly _paymentService: IPaymentService,
  ) {}

  async execute(
    userId: string,
    amount: number,
    currency: string,
  ): Promise<string> {
    if (amount <= 0) {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        MESSAGES.WALLET.INVALID_AMOUNT,
      );
    }

    const wallet = await this._walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.WALLET.NOT_FOUND,
      );
    }

    const { gatewayRef, paymentUrl } = await this._paymentService.createIntent(
      amount,
      currency,
      { walletId: wallet.id! },
    );

    await this._transactionRepository.createTransaction({
      direction: TransactionDirection.CREDIT,
      type: TransactionType.WALLET_TOPUP,
      source: TransactionSource.STRIPE,
      amount,
      currency,
      walletId: wallet.id,
      userId,
      status: PaymentStatus.INITIATED,
      gatewayRef,
    });

    return paymentUrl;
  }
}
