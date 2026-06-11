import { Document, model, Schema, Types } from "mongoose";

export interface IConsultationReportDocument extends Document {
  _id: Types.ObjectId;
  appointmentId: Types.ObjectId;
  patientId: Types.ObjectId;
  doctorId: Types.ObjectId;
  chiefComplaint: string;
  clinicalNotes: string;
  diagnosis: string;
  followUpDate: Date | null;
  followUpNotes: string;
  createdAt: Date;
  updatedAt: Date;
}

const consultationReportSchema = new Schema<IConsultationReportDocument>(
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
    chiefComplaint: {
      type: String,
      required: true,
      trim: true,
    },
    clinicalNotes: {
      type: String,
      default: "",
      trim: true,
    },
    diagnosis: {
      type: String,
      required: true,
      trim: true,
    },
    followUpDate: {
      type: Date,
      default: null,
    },
    followUpNotes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true },
);

consultationReportSchema.index({ appointmentId: 1 }, { unique: true });
consultationReportSchema.index({ patientId: 1 });
consultationReportSchema.index({ doctorId: 1 });

export const consultationReportModel = model<IConsultationReportDocument>(
  "ConsultationReport",
  consultationReportSchema,
);
