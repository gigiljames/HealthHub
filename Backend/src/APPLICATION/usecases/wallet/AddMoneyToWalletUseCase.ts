import { ITransactionRepository } from "../../../domain/interfaces/repositories/ITransactionRepository";
import { IWalletRepository } from "../../../domain/interfaces/repositories/IWalletRepository";
import { IPaymentService } from "../../../domain/interfaces/services/IPaymentService";
import { TransactionDirection } from "../../../domain/enums/transactionDirection";
import { TransactionType } from "../../../domain/enums/transactionType";
import { TransactionSource } from "../../../domain/enums/transactionSource";
import { PaymentStatus } from "../../../domain/enums/paymentStatus";

export class AddMoneyToWalletUseCase {
  constructor(
    private readonly walletRepository: IWalletRepository,
    private readonly transactionRepository: ITransactionRepository,
    private readonly paymentService: IPaymentService,
  ) {}

  async execute(
    userId: string,
    amount: number,
    currency: string,
  ): Promise<string> {
    if (amount <= 0) {
      throw new Error("Amount must be greater than zero");
    }

    const wallet = await this.walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new Error("Wallet not found");
    }

    const { gatewayRef, paymentUrl } = await this.paymentService.createIntent(
      amount,
      currency,
      { walletId: wallet.id },
    );

    await this.transactionRepository.createTransaction({
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
