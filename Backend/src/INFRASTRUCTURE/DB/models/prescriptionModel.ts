import { Document, model, Schema, Types } from "mongoose";

export interface IPrescriptionMedicineDocument {
  medicine: string;
  dosage: string;
  frequency: string;
  timing: "Before Food" | "After Food";
  duration: string;
}

export interface IPrescriptionDocument extends Document {
  _id: Types.ObjectId;
  appointmentId: Types.ObjectId;
  patientId: Types.ObjectId;
  doctorId: Types.ObjectId;
  medicines: IPrescriptionMedicineDocument[];
  verificationToken?: string;
  prescriptionNumber?: string;
  status?: string;
  signatureKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const prescriptionMedicineSchema = new Schema<IPrescriptionMedicineDocument>(
  {
    medicine: {
      type: String,
      required: true,
      trim: true,
    },
    dosage: {
      type: String,
      required: true,
      trim: true,
    },
    frequency: {
      type: String,
      required: true,
      trim: true,
    },
    timing: {
      type: String,
      enum: ["Before Food", "After Food"],
      required: true,
    },
    duration: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

const prescriptionSchema = new Schema<IPrescriptionDocument>(
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
    medicines: {
      type: [prescriptionMedicineSchema],
      default: [],
    },
    verificationToken: {
      type: String,
      unique: true,
      sparse: true,
    },
    prescriptionNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    status: {
      type: String,
      enum: ["Valid", "Revoked", "Expired"],
      default: "Valid",
    },
    signatureKey: {
      type: String,
    },
  },
  { timestamps: true },
);

prescriptionSchema.index({ appointmentId: 1 }, { unique: true });
prescriptionSchema.index({ patientId: 1 });
prescriptionSchema.index({ doctorId: 1 });
prescriptionSchema.index({ verificationToken: 1 }, { unique: true, sparse: true });
prescriptionSchema.index({ prescriptionNumber: 1 }, { unique: true, sparse: true });

export const prescriptionModel = model<IPrescriptionDocument>(
  "Prescription",
  prescriptionSchema,
);

