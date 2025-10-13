import { BloodGroup } from "../../../DOMAIN/enums/bloodGroup";
import { Gender } from "../../../DOMAIN/enums/gender";
import { MaritalStatus } from "../../../DOMAIN/enums/maritalStatus";
import { Surgery } from "../../../DOMAIN/types/surgeryType";

export interface UGetProfileStage1DTO {
  maritalStatus: MaritalStatus;
  gender: Gender;
  dob: Date;
  bloodGroup: BloodGroup;
  allergies: string[];
  occupation: string;
}

export interface UGetProfileStage2DTO {
  height: number;
  weight: number;
  address: string;
  phoneNumber: string;
}

export interface UGetProfileStage3DTO {
  tb: boolean;
  bronchialAsthma: boolean;
  epilepsy: boolean;
}

export interface UGetProfileStage4DTO {
  surgeries: Surgery[];
}

export interface UProfileCreation1DTO {
  userId: string;
  maritalStatus: MaritalStatus;
  gender: Gender;
  dob: Date;
  bloodGroup: BloodGroup;
  allergies: string[];
  occupation: string;
}

export interface UProfileCreation2DTO {
  userId: string;
  height: number;
  weight: number;
  address: string;
  phoneNumber: string;
}

export interface UProfileCreation3DTO {
  userId: string;
  tb: boolean;
  bronchialAsthma: boolean;
  epilepsy: boolean;
}

export interface UProfileCreation4DTO {
  userId: string;
  surgeries: Surgery[];
}
