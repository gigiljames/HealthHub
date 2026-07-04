import { Document, model, Schema, Types } from "mongoose";
import { RescheduleStatus } from "../../../domain/enums/rescheduleStatus";

export interface IRescheduleRequestDocument extends Document {
  _id: Types.ObjectId;
  appointmentId: Types.ObjectId;
  oldSlotId: Types.ObjectId;
  newSlotId: Types.ObjectId;
  doctorId: Types.ObjectId;
  patientId: Types.ObjectId;
  status: string;
  reason: string;
  customReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const rescheduleRequestSchema = new Schema<IRescheduleRequestDocument>(
  {
    appointmentId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Appointment",
    },
    oldSlotId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Slot",
    },
    newSlotId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Slot",
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Auth",
    },
    patientId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Auth",
    },
    status: {
      type: String,
      enum: Object.values(RescheduleStatus),
      default: RescheduleStatus.PENDING,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    customReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

rescheduleRequestSchema.index({ appointmentId: 1, status: 1 });

export const rescheduleRequestModel = model<IRescheduleRequestDocument>(
  "RescheduleRequest",
  rescheduleRequestSchema,
);
