import { Document, model, Schema, Types } from "mongoose";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus";

export interface IAppointmentDocument extends Document {
  _id: Types.ObjectId;
  patientId: Types.ObjectId;
  doctorId: Types.ObjectId;
  slotId: Types.ObjectId;
  status: string;
  reason: string;
  paymentId: Types.ObjectId | null;
  payoutId: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointmentDocument>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Auth",
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Auth",
    },
    slotId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Slot",
    },
    status: {
      type: String,
      enum: Object.values(AppointmentStatus),
      default: AppointmentStatus.PENDING_PAYMENT,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },
    payoutId: {
      type: Schema.Types.ObjectId,
      ref: "Payout",
      default: null,
    },
  },
  { timestamps: true },
);

appointmentSchema.index({ patientId: 1, status: 1 });
appointmentSchema.index({ doctorId: 1, status: 1 });

export const appointmentModel = model<IAppointmentDocument>(
  "Appointment",
  appointmentSchema,
);
