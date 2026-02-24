import { ConsultationModes } from "../enums/consultationModes";
import { PracticeLocationType } from "../enums/practiceLocationType";

export type PracticeLocation = {
  _id?: string;
  organizationId?: string;
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
