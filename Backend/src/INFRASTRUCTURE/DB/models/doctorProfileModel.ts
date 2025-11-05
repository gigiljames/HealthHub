import { model, Schema } from "mongoose";
import { DoctorWorkType } from "../../../domain/enums/doctorWorkTypes";
import {
  placeholderBannerUrl,
  placeholderImageUrl,
} from "../../../domain/constants/others";
import { VerificationStatus } from "../../../domain/enums/verificationStatus";
import { Gender } from "../../../domain/enums/gender";

const educationSchema = new Schema({
  title: { type: String },
  institution: { type: String },
  graduationYear: { type: Number },
});

const experienceSchema = new Schema({
  designation: {
    type: String,
  },
  hospital: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
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

const doctorProfileSchema = new Schema({
  doctorId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Doctor",
  },
  profileImageUrl: {
    type: String,
    required: true,
    default: placeholderImageUrl,
  },
  bannerImageUrl: {
    type: String,
    required: true,
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
  },
  certificates: {
    latestDegree: {
      type: String,
      required: true,
      default: placeholderImageUrl,
    },
    medicalLicence: {
      type: String,
      required: true,
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
  isVisible: {
    type: Boolean,
    required: true,
    default: false,
  },
});

export const DoctorProfileModel = model("DoctorProfile", doctorProfileSchema);
