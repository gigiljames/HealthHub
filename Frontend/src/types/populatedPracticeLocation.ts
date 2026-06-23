import { ConsultationModes } from "../enums/consultationModes";
import { PracticeLocationType } from "../enums/practiceLocationType";

export interface Organization {
  _id?: string;
  name: string;
  email?: string;
  organizationType?: string;
  verificationStatus?: string;
  organizationCode?: string;
}

export type PopulatedPracticeLocation = {
  _id?: string;
  organizationId?: Organization;
  name: string;
  type: PracticeLocationType;
  location?: {
    type: "Point";
    coordinates: number[];
    address: string;
    placeId: string;
  };
  consultationFee: number;
  consultationModes: ConsultationModes[];
  isPrimary: boolean;
  isActive: boolean;
};
