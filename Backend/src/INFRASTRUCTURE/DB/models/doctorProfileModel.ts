import { model, Schema, Document, ObjectId, Types } from "mongoose";
import { DoctorWorkType } from "../../../domain/enums/doctorWorkTypes";
import {
  placeholderBannerUrl,
  placeholderImageUrl,
} from "../../../domain/constants/others";
import { VerificationStatus } from "../../../domain/enums/verificationStatus";
import { Gender } from "../../../domain/enums/gender";
import { DoctorEducation } from "../../../domain/types/doctorEducationType";
import { DoctorExperience } from "../../../domain/types/doctorExperienceType";
import { ISpecializationDocument } from "./specializationModel";
import { DoctorCertificates } from "../../../domain/entities/doctorProfile";
import { PracticeType } from "../../../domain/enums/practiceType";
import { VerificationSubmission } from "../../../domain/types/verificationSubmission";
import { PracticeLocation } from "../../../domain/types/practiceLocation";
import { PracticeLocationType } from "../../../domain/enums/practiceLocationType";
import { ConsultationModes } from "../../../domain/enums/consultationModes";
import { required } from "zod/mini";
import Auth from "../../../domain/entities/auth";
import { PopulatedPracticeLocation } from "../../../domain/types/populatedPracticeLocation";
import { IAuthDocument } from "./authModel";

export interface IDoctorProfileDocument extends Document {
  _id: Types.ObjectId;
  doctorId: Types.ObjectId;
  profileImageUrl: string;
  bannerImageUrl: string;
  dob?: Date;
  gender: Gender;
  phone?: string;
  address?: string;
  about?: string;
  education: DoctorEducation[];
  experience: DoctorExperience[];
  specialization?: Types.ObjectId;
  certificates: DoctorCertificates;
  practiceType?: PracticeType;
  practiceLocations: PracticeLocation[];
  verificationStatus?: VerificationStatus;
  verificationSubmissions: VerificationSubmission[];
  activeSubmissionId: string;
  acceptedTerms?: boolean;
  submissionDate?: Date;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDoctorProfilePopulatedDocument extends Document {
  doctorId: IAuthDocument;
  profileImageUrl: string;
  bannerImageUrl: string;
  dob?: Date;
  gender: Gender;
  phone?: string;
  address?: string;
  about?: string;
  education: DoctorEducation[];
  experience: DoctorExperience[];
  specialization?: ISpecializationDocument;
  certificates: DoctorCertificates;
  practiceType?: PracticeType;
  practiceLocations: PopulatedPracticeLocation[];
  verificationStatus?: VerificationStatus;
  verificationSubmissions: VerificationSubmission[];
  activeSubmissionId: string;
  acceptedTerms?: boolean;
  submissionDate?: Date;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDoctorProfileSpecializationPopulatedDocument extends Document {
  doctorId: Types.ObjectId;
  profileImageUrl: string;
  bannerImageUrl: string;
  dob?: Date;
  gender: Gender;
  phone?: string;
  address?: string;
  about?: string;
  education: DoctorEducation[];
  experience: DoctorExperience[];
  specialization?: ISpecializationDocument;
  certificates: DoctorCertificates;
  practiceType?: PracticeType;
  practiceLocations: PracticeLocation[];
  verificationStatus?: VerificationStatus;
  verificationSubmissions: VerificationSubmission[];
  activeSubmissionId: string;
  acceptedTerms?: boolean;
  submissionDate?: Date;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const geoLocationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    placeId: {
      type: String,
    },
  },
  { _id: false },
);

const practiceLocationSchema = new Schema({
  _id: {
    type: String,
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: "Organization",
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: Object.values(PracticeLocationType),
    required: true,
  },
  location: {
    type: geoLocationSchema,
    default: undefined,
  },
  consultationFee: {
    type: Number,
    required: true,
  },
  consultationModes: {
    type: [String],
    enum: Object.values(ConsultationModes),
    required: true,
  },
  isPrimary: {
    type: Boolean,
    required: true,
    default: false,
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
  },
});

const verificationSubmissions = new Schema({
  _id: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(VerificationStatus),
  },
  remarks: {
    type: String,
  },
  submissionDate: {
    type: Date,
  },
  reviewDate: {
    type: Date,
  },
});

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
    education: {
      type: [educationSchema],
    },
    experience: {
      type: [experienceSchema],
    },
    practiceType: {
      type: String,
      enum: Object.values(PracticeType),
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
    practiceLocations: {
      type: [practiceLocationSchema],
    },
    verificationStatus: {
      type: String,
      enum: Object.values(VerificationStatus),
    },
    verificationSubmissions: {
      type: [verificationSubmissions],
    },
    activeSubmissionId: {
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
  { timestamps: true },
);

doctorProfileSchema.index({
  "practiceLocations.location": "2dsphere",
});

export const DoctorProfileModel = model<IDoctorProfileDocument>(
  "DoctorProfile",
  doctorProfileSchema,
);
