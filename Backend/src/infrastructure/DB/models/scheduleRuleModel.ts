import { Document, model, Schema, Types } from "mongoose";

export interface IScheduleRuleDocument extends Document {
  _id: Types.ObjectId;
  doctorId: Types.ObjectId;
  title: string;
  practiceLocationId: string;
  mode: "online" | "in-person";
  duration: number;
  buffer: number;
  rruleString: string;
  validFrom: Date;
  validTo: Date | null;
  startHour: string;
  endHour: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const scheduleRuleSchema = new Schema<IScheduleRuleDocument>(
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
    practiceLocationId: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      enum: ["online", "in-person"],
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    buffer: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    rruleString: {
      type: String,
      required: true,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validTo: {
      type: Date,
      default: null,
    },
    startHour: {
      type: String,
      required: true,
    },
    endHour: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

scheduleRuleSchema.index({ doctorId: 1, isActive: 1 });
scheduleRuleSchema.index({ doctorId: 1, validFrom: 1, validTo: 1 });

export const scheduleRuleModel = model<IScheduleRuleDocument>(
  "ScheduleRule",
  scheduleRuleSchema,
);
