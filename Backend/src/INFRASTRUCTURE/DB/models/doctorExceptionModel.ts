import { Document, model, Schema, Types } from "mongoose";

export interface IDoctorExceptionDocument extends Document {
  _id: Types.ObjectId;
  doctorId: Types.ObjectId;
  reason: string;
  startDatetime: Date;
  endDatetime: Date;
  createdAt: Date;
  updatedAt: Date;
}

const doctorExceptionSchema = new Schema<IDoctorExceptionDocument>(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Auth",
    },
    reason: {
      type: String,
      required: true,
    },
    startDatetime: {
      type: Date,
      required: true,
    },
    endDatetime: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

doctorExceptionSchema.index({ doctorId: 1, startDatetime: 1, endDatetime: 1 });

export const doctorExceptionModel = model<IDoctorExceptionDocument>(
  "DoctorException",
  doctorExceptionSchema,
);
