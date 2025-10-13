import { Document, model, ObjectId, Schema } from "mongoose";
import { BloodGroup } from "../../../DOMAIN/enums/bloodGroup";
import { MaritalStatus } from "../../../DOMAIN/enums/maritalStatus";
import { Gender } from "../../../DOMAIN/enums/gender";
import { placeholderImageUrl } from "../../../DOMAIN/constants/others";
import { BodyMetrics } from "../../../DOMAIN/types/bodyMetricsType";
import { Diseases } from "../../../DOMAIN/types/diseasesType";
import { Surgery } from "../../../DOMAIN/types/surgeryType";

export interface IUserProfileDocument extends Document {
  userId: ObjectId;
  bloodGroup: BloodGroup;
  maritalStatus: MaritalStatus;
  dob: Date;
  gender: Gender;
  occupation: string;
  profileImageUrl: string;
  allergies: string[];
  bodyMetrics: BodyMetrics;
  contact: {
    address: string;
    phone: string;
  };
  pastDiseases: Diseases;
  pastSurgeries: Surgery[];
  createdAt: Date;
  updatedAt: Date;
}

const surgerySchema = new Schema({
  year: {
    type: Number,
  },
  surgeryName: {
    type: String,
  },
  reason: {
    type: String,
  },
  surgeryType: {
    type: String,
    enum: ["major", "minor"],
  },
  doctor: {
    type: String,
  },
  hospital: {
    type: String,
  },
});

const diseasesSchema = new Schema({
  tuberculosis: {
    type: {
      value: Boolean,
      lastUpdated: Date,
    },
  },
  epilepsy: {
    type: {
      value: Boolean,
      lastUpdated: Date,
    },
  },
  bronchialAsthma: {
    type: {
      value: Boolean,
      lastUpdated: Date,
    },
  },
});

const userProfileSchema = new Schema<IUserProfileDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    bloodGroup: {
      type: String,
      enum: BloodGroup,
      default: BloodGroup.none,
    },
    maritalStatus: {
      type: String,
      enum: Object.values(MaritalStatus),
      default: MaritalStatus.none,
    },
    dob: {
      type: Date,
    },
    gender: {
      type: String,
      enum: Object.values(Gender),
      default: Gender.none,
    },
    occupation: {
      type: String,
    },
    profileImageUrl: {
      type: String,
      default: placeholderImageUrl,
    },
    allergies: {
      type: [String],
    },
    bodyMetrics: {
      type: {
        height: Number,
        weight: Number,
        lastUpdated: Date,
      },
    },
    contact: {
      type: {
        address: String,
        phone: String,
      },
    },
    pastDiseases: {
      type: diseasesSchema,
    },

    pastSurgeries: {
      type: [surgerySchema],
    },
  },
  { timestamps: true }
);

export const userProfileModel = model<IUserProfileDocument>(
  "UserProfile",
  userProfileSchema
);
