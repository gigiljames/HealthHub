import { Document, model, Schema } from "mongoose";

export interface ISpecializationDocument extends Document {
  name: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const specializationSchema = new Schema<ISpecializationDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    isActive: {
      type: Boolean,
      requried: true,
      default: true,
    },
  },
  { timestamps: true }
);

export const specializationModel = model<ISpecializationDocument>(
  "Specialization",
  specializationSchema
);
