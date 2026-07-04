import { Document, model, Schema, Types } from "mongoose";
import { SlotStatus } from "../../../domain/enums/slotStatus";

export interface ISlotDocument extends Document {
  _id: Types.ObjectId;
  doctorId: Types.ObjectId;
  title: string;
  start: Date;
  end: Date;
  mode: "online" | "in-person";
  practiceLocationId: string;
  status: SlotStatus;
  lockedUntil: Date | null;
  lockedBy: Types.ObjectId | null;
  appointmentId: Types.ObjectId | null;
  scheduleRuleId: Types.ObjectId | null;
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
      enum: [
        SlotStatus.AVAILABLE,
        SlotStatus.LOCKED,
        SlotStatus.BOOKED,
        SlotStatus.CANCELLED,
        SlotStatus.BLOCKED,
      ],
      default: SlotStatus.AVAILABLE,
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
    scheduleRuleId: {
      type: Schema.Types.ObjectId,
      ref: "ScheduleRule",
      default: null,
    },
  },
  { timestamps: true },
);

slotSchema.index({ doctorId: 1, start: 1, practiceLocationId: 1 });
slotSchema.index({ scheduleRuleId: 1, start: 1 }, { unique: true, sparse: true });
slotSchema.index({ status: 1, lockedUntil: 1 });
slotSchema.index({ doctorId: 1, start: 1, status: 1 });

export const slotModel = model<ISlotDocument>("Slot", slotSchema);
