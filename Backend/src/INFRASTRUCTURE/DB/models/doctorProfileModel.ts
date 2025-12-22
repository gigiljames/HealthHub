import { model, Schema, Document, ObjectId } from "mongoose";
import { DoctorWorkType } from "../../../domain/enums/doctorWorkTypes";
import {
  placeholderBannerUrl,
  placeholderImageUrl,
} from "../../../domain/constants/others";
import { VerificationStatus } from "../../../domain/enums/verificationStatus";
import { Gender } from "../../../domain/enums/gender";
import { DoctorEducation } from "../../../domain/types/doctorEducationType";
import { DoctorExperience } from "../../../domain/types/doctorExperienceType";
import Specialization from "../../../domain/entities/specialization";
import { ISpecializationDocument } from "./specializationModel";

export interface DoctorSlot {
  start: string;
  end: string;
}

export interface DoctorAvailability {
  date: Date;
  isLeave: boolean;
  slots: DoctorSlot[];
}

export interface DoctorLocation {
  type: "Point";
  coordinates: number[];
  address?: string;
  placeId?: string;
}

export interface DoctorCertificates {
  latestDegree: string;
  medicalLicence: string;
}

export interface IDoctorProfileDocument extends Document {
  doctorId: ObjectId;
  profileImageUrl: string;
  bannerImageUrl: string;
  dob?: Date;
  gender: Gender;
  phone?: string;
  address?: string;
  about?: string;
  independentFee?: number;
  education: DoctorEducation[];
  experience: DoctorExperience[];
  availability: DoctorAvailability[];
  location?: DoctorLocation;
  specialization?: ObjectId;
  certificates: DoctorCertificates;
  hospitalId?: ObjectId;
  verificationStatus?: VerificationStatus;
  verificationRemarks?: string;
  acceptedTerms?: boolean;
  submissionDate?: Date;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDoctorProfilePopulatedDocument extends Document {
  doctorId: ObjectId;
  profileImageUrl: string;
  bannerImageUrl: string;
  dob?: Date;
  gender: Gender;
  phone?: string;
  address?: string;
  about?: string;
  independentFee?: number;
  education: DoctorEducation[];
  experience: DoctorExperience[];
  availability: DoctorAvailability[];
  location?: DoctorLocation;
  specialization?: ISpecializationDocument;
  certificates: DoctorCertificates;
  hospitalId?: ObjectId;
  verificationStatus?: VerificationStatus;
  verificationRemarks?: string;
  acceptedTerms?: boolean;
  submissionDate?: Date;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const educationSchema = new Schema({
  title: { type: String },
  institution: { type: String },
  graduationYear: { type: Number },
  description: { type: String },
});

const experienceSchema = new Schema({
  designation: {
    type: String,
  },
  hospital: { type: String },
  description: { type: String },
  location: {
    type: String,
  },
  present: { type: Boolean, default: false },
  startDate: {
    month: { type: Number },
    year: { type: Number },
  },
  endDate: {
    month: { type: Number },
    year: { type: Number },
  },
  type: {
    type: String,
    enum: Object.values(DoctorWorkType),
  },
});

const slotSchema = new Schema({
  start: String,
  end: String,
});

const availabilitySchema = new Schema({
  date: { type: Date },
  isLeave: { type: Boolean, default: false },
  slots: {
    type: [slotSchema],
    default: [],
  },
});

const doctorProfileSchema = new Schema(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Auth",
    },
    profileImageUrl: {
      type: String,
      // required: true,
      default: placeholderImageUrl,
    },
    bannerImageUrl: {
      type: String,
      // required: true,
      default: placeholderBannerUrl,
    },
    dob: {
      type: Date,
    },
    gender: {
      type: String,
      enum: Object.values(Gender),
      required: true,
      default: Gender.none,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    about: {
      type: String,
    },
    independentFee: {
      type: Number,
    },
    education: {
      type: [educationSchema],
    },
    experience: {
      type: [experienceSchema],
    },
    availability: {
      type: [availabilitySchema],
    },
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
    specialization: {
      type: Schema.Types.ObjectId,
      ref: "Specialization",
    },
    certificates: {
      latestDegree: {
        type: String,
        // required: true,
        default: placeholderImageUrl,
      },
      medicalLicence: {
        type: String,
        // required: true,
        default: placeholderImageUrl,
      },
    },
    hospitalId: {
      type: Schema.Types.ObjectId,
    },
    verificationStatus: {
      type: String,
      enum: Object.values(VerificationStatus),
    },
    verificationRemarks: {
      type: String,
    },
    acceptedTerms: {
      type: Boolean,
    },
    submissionDate: {
      type: Date,
    },

    isVisible: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

export const DoctorProfileModel = model<IDoctorProfileDocument>(
  "DoctorProfile",
  doctorProfileSchema
);
