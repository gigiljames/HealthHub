import { Document, model, Schema, Types } from "mongoose";
import { TransactionDirection } from "../../../domain/enums/transactionDirection";
import { TransactionType } from "../../../domain/enums/transactionType";
import { TransactionSource } from "../../../domain/enums/transactionSource";
import { PaymentStatus } from "../../../domain/enums/paymentStatus";

export interface ITransactionDocument extends Document {
  _id: Types.ObjectId;
  direction: TransactionDirection;
  type: TransactionType;
  source: TransactionSource;
  amount: number;
  currency: string;
  walletId: Types.ObjectId | null;
  gatewayRef: string | null;
  status: PaymentStatus;
  balanceAfter: number | null;
  appointmentId: Types.ObjectId | null;
  payoutId: Types.ObjectId | null;
  userId: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransactionDocument>(
  {
    direction: {
      type: String,
      enum: Object.values(TransactionDirection),
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    source: {
      type: String,
      enum: Object.values(TransactionSource),
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    walletId: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
      default: null,
    },
    gatewayRef: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      required: true,
    },
    balanceAfter: {
      type: Number,
      default: null,
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },
    payoutId: {
      type: Schema.Types.ObjectId,
      ref: "Payout",
      default: null,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      default: null,
    },
  },
  { timestamps: true },
);

transactionSchema.index({ gatewayRef: 1 });
transactionSchema.index({ appointmentId: 1 });
transactionSchema.index({ payoutId: 1 });
transactionSchema.index({ walletId: 1 });
transactionSchema.index({ userId: 1 });
transactionSchema.index({ createdAt: -1 });

export const transactionModel = model<ITransactionDocument>(
  "Transaction",
  transactionSchema,
);
