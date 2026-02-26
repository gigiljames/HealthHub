import { Document, model, Schema, Types } from "mongoose";

export interface ISlotDocument extends Document {
  _id: Types.ObjectId;
  doctorId: Types.ObjectId;
  title: string;
  start: Date;
  end: Date;
  mode: "online" | "in-person";
  practiceLocationId: string;
  status: "AVAILABLE" | "LOCKED" | "BOOKED" | "CANCELLED";
  lockedUntil: Date | null;
  lockedBy: Types.ObjectId | null;
  appointmentId: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const slotSchema = new Schema<ISlotDocument>(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Auth",
    },
    title: {
      type: String,
      required: true,
    },
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
    mode: {
      type: String,
      required: true,
    },
    practiceLocationId: {
      type: String,
    },
    status: {
      type: String,
      enum: ["AVAILABLE", "LOCKED", "BOOKED", "CANCELLED"],
      default: "AVAILABLE",
      required: true,
    },
    lockedUntil: {
      type: Date,
      default: null,
    },
    lockedBy: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },
  },
  { timestamps: true },
);

slotSchema.index({ doctorId: 1, start: 1, practiceLocationId: 1 });
slotSchema.index({ status: 1, lockedUntil: 1 });
slotSchema.index({ doctorId: 1, start: 1, status: 1 });

export const slotModel = model<ISlotDocument>("Slot", slotSchema);
