import { Document, model, Schema, Types } from "mongoose";
import { OrganizationType } from "../../../domain/enums/organizationType";

export interface IOrganizationSubmission {
  submittedAt: Date;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  rejectionReason?: string;
}

export interface IOrganizationDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  organizationType: OrganizationType;
  location?: {
    type: "Point";
    coordinates: number[];
    address: string;
    placeId: string;
  };
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId?: string;
  isVerified: boolean;
  isBlocked: boolean;
  email: string;
  organizationCode: string | null;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  rejectionReason: string | null;
  submissionHistory: IOrganizationSubmission[];
  createdAt: Date;
  updatedAt: Date;
}

const organizationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    organizationType: {
      type: String,
      enum: Object.values(OrganizationType),
      required: true,
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
    accountHolderName: {
      type: String,
      required: true,
    },
    bankName: {
      type: String,
      required: true,
    },
    accountNumber: {
      type: String,
      required: true,
    },
    ifscCode: {
      type: String,
      required: true,
    },
    upiId: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    organizationCode: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
    },
    verificationStatus: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED"],
      default: "PENDING",
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    submissionHistory: {
      type: [
        {
          submittedAt: {
            type: Date,
            required: true,
            default: Date.now,
          },
          status: {
            type: String,
            enum: ["PENDING", "VERIFIED", "REJECTED"],
            required: true,
            default: "PENDING",
          },
          rejectionReason: {
            type: String,
            default: null,
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);


export const OrganizationModel = model<IOrganizationDocument>(
  "Organization",
  organizationSchema,
);
