import { Document, model, Schema, Types } from "mongoose";
import { PayoutStatus } from "../../../domain/enums/payoutStatus";

export interface IPayoutDocument extends Document {
  _id: Types.ObjectId;
  doctorId: Types.ObjectId;
  amount: number;
  currency: string;
  status: string;
  gatewayRef: string | null;
  appointmentIds: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const payoutSchema = new Schema<IPayoutDocument>(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Auth",
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: "USD",
    },
    status: {
      type: String,
      enum: Object.values(PayoutStatus),
      default: PayoutStatus.PENDING,
      required: true,
    },
    gatewayRef: {
      type: String,
      default: null,
    },
    appointmentIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Appointment",
      },
    ],
  },
  { timestamps: true },
);

payoutSchema.index({ doctorId: 1, status: 1 });
payoutSchema.index({ gatewayRef: 1 });

export const payoutModel = model<IPayoutDocument>("Payout", payoutSchema);
