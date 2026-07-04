import { ConsultationModes } from "../enums/consultationModes";
import { PracticeLocationType } from "../enums/practiceLocationType";
import { Organization } from "../entities/organization";

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
