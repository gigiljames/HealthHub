import { Document, model, Schema, Types } from "mongoose";

export interface IUploadedDocumentDocument extends Document {
  _id: Types.ObjectId;
  patientId: Types.ObjectId;
  title: string;
  category: string;
  customCategory?: string;
  specializationId?: Types.ObjectId;
  customSpecialization?: string;
  fileKey: string;
  thumbnailKey: string;
  reportDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const uploadedDocumentSchema = new Schema<IUploadedDocumentDocument>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Auth",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    customCategory: {
      type: String,
      trim: true,
    },
    specializationId: {
      type: Schema.Types.ObjectId,
      ref: "Specialization",
    },
    customSpecialization: {
      type: String,
      trim: true,
    },
    fileKey: {
      type: String,
      required: true,
    },
    thumbnailKey: {
      type: String,
      required: true,
    },
    reportDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

uploadedDocumentSchema.index({ patientId: 1 });
uploadedDocumentSchema.index({ reportDate: -1 });

export const uploadedDocumentModel = model<IUploadedDocumentDocument>(
  "UploadedDocument",
  uploadedDocumentSchema
);
