import { Document, model, Schema, Types } from "mongoose";

export interface ISlotDocument extends Document {
  _id: Types.ObjectId;
  doctorId: Types.ObjectId;
  title: string;
  start: Date;
  end: Date;
  mode: "online" | "in-person";
  practiceLocationId: string;
  isBooked: boolean;
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
    isBooked: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true },
);

slotSchema.index({ doctorId: 1, start: 1, practiceLocationId: 1 });

export const slotModel = model<ISlotDocument>("Slot", slotSchema);
