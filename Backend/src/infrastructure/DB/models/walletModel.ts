import { Document, model, Schema, Types } from "mongoose";

export interface IWalletDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  currency: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

const walletSchema = new Schema<IWalletDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Auth",
    },
    currency: {
      type: String,
      required: true,
      default: "INR",
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

walletSchema.index({ userId: 1 }, { unique: true });

export const walletModel = model<IWalletDocument>("Wallet", walletSchema);
