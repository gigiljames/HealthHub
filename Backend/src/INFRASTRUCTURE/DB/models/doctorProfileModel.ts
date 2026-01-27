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
import { ISpecializationDocument } from "./specializationModel";
import { DoctorCertificates } from "../../../domain/entities/doctorProfile";
import { PracticeType } from "../../../domain/enums/practiceType";
import { VerificationSubmission } from "../../../domain/types/verificationSubmission";

export interface IDoctorProfileDocument extends Document {
  doctorId: ObjectId;
  profileImageUrl: string;
  bannerImageUrl: string;
  dob?: Date;
  gender: Gender;
  phone?: string;
  address?: string;
  about?: string;
  education: DoctorEducation[];
  experience: DoctorExperience[];
  specialization?: ObjectId;
  certificates: DoctorCertificates;
  practiceType?: PracticeType;
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
  doctorId: ObjectId;
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
  verificationStatus?: VerificationStatus;
  verificationSubmissions: VerificationSubmission[];
  activeSubmissionId: string;
  acceptedTerms?: boolean;
  submissionDate?: Date;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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

export const DoctorProfileModel = model<IDoctorProfileDocument>(
  "DoctorProfile",
  doctorProfileSchema,
);
