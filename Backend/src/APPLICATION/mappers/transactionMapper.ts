import Transaction from "../../domain/entities/transaction";
import { PaymentStatus } from "../../domain/enums/paymentStatus";
import { TransactionDirection } from "../../domain/enums/transactionDirection";
import { TransactionSource } from "../../domain/enums/transactionSource";
import { TransactionType } from "../../domain/enums/transactionType";
import { ITransactionDocument } from "../../infrastructure/DB/models/transactionModel";
import { TransactionDetailsDTO } from "../DTOs/transaction/transactionDTO";
import { TransactionWithUserAgg } from "../../domain/types/repositoryTypes";

export class TransactionMapper {
  static toEntityFromDocument(doc: ITransactionDocument): Transaction {
    return new Transaction({
      id: doc._id.toString(),
      direction: doc.direction as TransactionDirection,
      type: doc.type as TransactionType,
      source: doc.source as TransactionSource,
      amount: doc.amount,
      currency: doc.currency,
      walletId: doc.walletId?.toString() || null,
      gatewayRef: doc.gatewayRef || null,
      status: doc.status as PaymentStatus,
      balanceAfter: doc.balanceAfter ?? null,
      appointmentId: doc.appointmentId?.toString() ?? undefined,
      payoutId: doc.payoutId?.toString() ?? undefined,
    });
  }

  static toTransactionDetailsDTO(
    transaction: TransactionWithUserAgg,
    profileImageUrl: string | null,
  ): TransactionDetailsDTO {
    return {
      _id: transaction._id.toString(),
      direction: transaction.direction,
      type: transaction.type,
      source: transaction.source,
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status,
      walletId: transaction.walletId?.toString() ?? undefined,
      appointmentId: transaction.appointmentId?.toString() ?? undefined,
      payoutId: transaction.payoutId?.toString() ?? undefined,
      gatewayRef: transaction.gatewayRef ?? undefined,
      createdAt: transaction.createdAt,
      user: transaction.user
        ? {
            _id: transaction.user._id.toString(),
            name: transaction.user.name,
            email: transaction.user.email,
            role: transaction.user.role,
            profileImageUrl: profileImageUrl || null,
          }
        : null,
    };
  }
}
