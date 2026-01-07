import { Document, model, ObjectId, Schema } from "mongoose";

export interface ISlotDocument extends Document {
  doctorId: ObjectId;
  title: string;
  start: string;
  end: string;
  mode: "online" | "in-person";
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
      type: String,
      required: true,
    },
    end: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      required: true,
    },
    isBooked: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

export const slotModel = model<ISlotDocument>("Slot", slotSchema);
