import { Document, model, Schema, Types } from "mongoose";
import { PaymentStatus } from "../../../domain/enums/paymentStatus";

export interface IPaymentDocument extends Document {
  _id: Types.ObjectId;
  amount: number;
  currency: string;
  appointmentId: Types.ObjectId;
  patientId: Types.ObjectId;
  status: string;
  gatewayRef: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPaymentDocument>(
  {
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: "USD",
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Appointment",
    },
    patientId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Auth",
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.INITIATED,
      required: true,
    },
    gatewayRef: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

paymentSchema.index({ gatewayRef: 1 });
paymentSchema.index({ appointmentId: 1 });

export const paymentModel = model<IPaymentDocument>("Payment", paymentSchema);
