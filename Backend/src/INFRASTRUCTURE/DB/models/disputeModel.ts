import { Document, model, Schema, Types } from "mongoose";

export interface IDisputeEvidence {
  key: string;
  name: string;
  type: string;
}

export interface IDisputeDocument extends Document {
  _id: Types.ObjectId;
  appointmentId: Types.ObjectId;
  reporterId: Types.ObjectId;
  reportedUserId: Types.ObjectId;
  reason: string;
  description: string;
  evidence: IDisputeEvidence[];
  status: "OPEN" | "UNDER_REVIEW" | "RESOLVED";
  resolutionMessage: string | null;
  resolvedBy: Types.ObjectId | null;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const disputeEvidenceSchema = new Schema<IDisputeEvidence>(
  {
    key: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
  },
  { _id: false },
);

const disputeSchema = new Schema<IDisputeDocument>(
  {
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    reportedUserId: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 1000,
    },
    evidence: {
      type: [disputeEvidenceSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["OPEN", "UNDER_REVIEW", "RESOLVED"],
      required: true,
      default: "OPEN",
    },
    resolutionMessage: {
      type: String,
      default: null,
      trim: true,
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

disputeSchema.index({ appointmentId: 1 });
disputeSchema.index({ reporterId: 1 });
disputeSchema.index({ reportedUserId: 1 });
disputeSchema.index({ status: 1 });
disputeSchema.index({ createdAt: -1 });

export const disputeModel = model<IDisputeDocument>("Dispute", disputeSchema);
