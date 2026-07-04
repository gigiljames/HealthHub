import { Document, model, Schema, Types } from "mongoose";

export interface IConsultationDocument extends Document {
  _id: Types.ObjectId;
  appointmentId: Types.ObjectId;
  patientId: Types.ObjectId;
  doctorId: Types.ObjectId;
  patientJoinedAt: Date | null;
  doctorJoinedAt: Date | null;
  startedAt: Date | null;
  endedAt: Date | null;
  roomId: string;
  patientSocketId: string | null;
  doctorSocketId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const consultationSchema = new Schema<IConsultationDocument>(
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
    patientJoinedAt: {
      type: Date,
      default: null,
    },
    doctorJoinedAt: {
      type: Date,
      default: null,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    roomId: {
      type: String,
      required: true,
    },
    patientSocketId: {
      type: String,
      default: null,
    },
    doctorSocketId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

consultationSchema.index({ appointmentId: 1 });
consultationSchema.index({ roomId: 1 });
consultationSchema.index({ patientSocketId: 1 });
consultationSchema.index({ doctorSocketId: 1 });

export const consultationModel = model<IConsultationDocument>(
  "Consultation",
  consultationSchema,
);
