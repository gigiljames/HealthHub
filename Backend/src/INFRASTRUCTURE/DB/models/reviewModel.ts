import { Document, model, Schema, Types } from "mongoose";

export interface IReviewDocument extends Document {
  _id: Types.ObjectId;
  appointmentId: Types.ObjectId;
  patientId: Types.ObjectId;
  doctorId: Types.ObjectId;
  answers: {
    q1: string;
    q2: string;
    q3: string;
    q4: string;
    q5: string;
  };
  score: number;
  comment?: string;
  isAnonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReviewDocument>(
  {
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
    doctorId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Auth",
    },
    answers: {
      q1: { type: String, required: true },
      q2: { type: String, required: true },
      q3: { type: String, required: true },
      q4: { type: String, required: true },
      q5: { type: String, required: true },
    },
    score: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      default: "",
      trim: true,
    },
    isAnonymous: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true },
);

reviewSchema.index({ appointmentId: 1 }, { unique: true });
reviewSchema.index({ patientId: 1 });
reviewSchema.index({ doctorId: 1 });

export const reviewModel = model<IReviewDocument>("Review", reviewSchema);
