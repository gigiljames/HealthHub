import { Document, model, Types, Schema } from "mongoose";
import { Roles } from "../../../domain/enums/roles";

export interface IAuthDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  googleId: string;
  profileId: Types.ObjectId;
  profileModel: string;
  role: Roles;
  isBlocked: boolean;
  isNewUser: boolean;
  onboardingStep: number;
  isBookingBlocked: boolean;
  suspensionStatus: "none" | "suspended" | "banned";
  suspensionStart: Date | null;
  suspensionEnd: Date | null;
  suspensionReason: string | null;
  suspendedBy: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const authSchema = new Schema<IAuthDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    passwordHash: {
      type: String,
    },
    googleId: {
      type: String,
    },
    profileId: {
      type: Schema.Types.ObjectId,
      refPath: "profileModel",
    },
    profileModel: {
      type: String,
      enum: ["UserProfile", "DoctorProfile"],
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(Roles),
      required: true,
    },
    isBlocked: {
      type: Boolean,
      required: true,
      default: false,
    },
    isNewUser: {
      type: Boolean,
      required: true,
      default: true,
    },
    onboardingStep: {
      type: Number,
      required: true,
      default: 0,
    },
    isBookingBlocked: {
      type: Boolean,
      required: true,
      default: false,
    },
    suspensionStatus: {
      type: String,
      enum: ["none", "suspended", "banned"],
      required: true,
      default: "none",
    },
    suspensionStart: {
      type: Date,
      default: null,
    },
    suspensionEnd: {
      type: Date,
      default: null,
    },
    suspensionReason: {
      type: String,
      default: null,
    },
    suspendedBy: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      default: null,
    },
  },
  { timestamps: true },
);

export const authModel = model<IAuthDocument>("Auth", authSchema);
