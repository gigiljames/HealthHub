import { Document, model, Schema } from "mongoose";
import { OrganizationType } from "../../../domain/enums/organizationType";

export interface IOrganizationDocument extends Document {
  name: string;
  organizationType: OrganizationType;
  location: {
    type: "Point";
    coordinates: number[];
    address: string;
    placeId: string;
  };
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  isVerified: boolean;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const organizationSchema = new Schema(
  {
    name: {
      type: String,
    },
    organizationType: {
      type: String,
      enum: Object.values(OrganizationType),
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
    },
    bankName: {
      type: String,
    },
    accountNumber: {
      type: String,
    },
    ifscCode: {
      type: String,
    },
    upiId: {
      type: String,
    },
    isVerified: {
      type: Boolean,
    },
    isBlocked: {
      type: Boolean,
    },
  },
  { timestamps: true },
);

export const OrganizationModel = model<IOrganizationDocument>(
  "Organization",
  organizationSchema,
);
