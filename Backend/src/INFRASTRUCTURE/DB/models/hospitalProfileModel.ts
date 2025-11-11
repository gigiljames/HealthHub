import { Document, model, ObjectId, Schema } from "mongoose";
import { HospitalCertificate } from "../../../domain/types/hospitalCertificateType";
import { HospitalContact } from "../../../domain/types/hospitalContactType";

export interface IHospitalProfileDocument extends Document {
  hospitalId: ObjectId;
  type: string;
  establishedYear: number;
  about: string;
  location: number[];
  profileImageUrl: string;
  bannerImageUrl: string;
  certificates: HospitalCertificate;
  features: string[];
  contact: HospitalContact;
  isVisible: boolean;
  lastUpdated: Date;
  acceptedTerms: boolean;
  submissionDate: Date;
  verificationStatus: string;
  verificationRemarks: string;
  createdAt: Date;
  updatedAt: Date;
}

const certificateSchema = new Schema<HospitalCertificate>({
  hospitalRegistration: {
    type: String,
    required: true,
  },
  gstCertificate: {
    type: String,
    required: true,
  },
});

const contactSchema = new Schema<HospitalContact>({
  address: {
    type: String,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
  },
  website: {
    type: String,
  },
});

const hospitalProfileSchema = new Schema<IHospitalProfileDocument>(
  {
    hospitalId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Hospital",
    },
    about: {
      type: String,
    },
    type: {
      type: String,
    },
    establishedYear: {
      type: Number,
    },
    location: {
      type: [Number],
    },
    profileImageUrl: {
      type: String,
    },
    bannerImageUrl: {
      type: String,
    },
    certificates: {
      type: certificateSchema,
    },
    features: {
      type: [String],
    },
    contact: {
      type: contactSchema,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    acceptedTerms: {
      type: Boolean,
    },
    submissionDate: {
      type: Date,
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    verificationRemarks: {
      type: String,
    },
  },
  { timestamps: true }
);

export const hospitalProfileModel = model<IHospitalProfileDocument>(
  "HospitalProfile",
  hospitalProfileSchema
);
