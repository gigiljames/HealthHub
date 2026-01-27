import { ObjectId, Schema } from "mongoose";
import { PracticeLocationType } from "../../../domain/enums/practiceLocationType";
import { model, Document } from "mongoose";
import { ConsultationModes } from "../../../domain/enums/consultationModes";

export interface IPracticeLocationDocument extends Document {
  doctorId: ObjectId;
  ownerId: ObjectId;
  name: string;
  type: PracticeLocationType;
  location: {
    type: "Point";
    coordinates: number[];
    address: string;
    placeId: string;
  };
  consultationFee: number;
  consultationModes: ConsultationModes[];
  createdAt: Date;
  updatedAt: Date;
}

const practiceLocationSchema = new Schema(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: "Auth" },
    ownerId: { type: Schema.Types.ObjectId, ref: "Organization" },
    name: { type: String },
    type: { type: String, enum: Object.values(PracticeLocationType) },
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
      },
      address: {
        type: String,
      },
      placeId: {
        type: String,
      },
    },
    consultationFee: { type: Number },
    consultationModes: {
      type: [String],
      enum: Object.values(ConsultationModes),
    },
  },
  { timestamps: true },
);

export const practiceLocationModel = model<IPracticeLocationDocument>(
  "PracticeLocation",
  practiceLocationSchema,
);
