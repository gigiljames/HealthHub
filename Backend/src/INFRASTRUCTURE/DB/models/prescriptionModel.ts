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
  },
  { timestamps: true },
);

prescriptionSchema.index({ appointmentId: 1 }, { unique: true });
prescriptionSchema.index({ patientId: 1 });
prescriptionSchema.index({ doctorId: 1 });

export const prescriptionModel = model<IPrescriptionDocument>(
  "Prescription",
  prescriptionSchema,
);
