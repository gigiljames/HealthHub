import { ConsultationModes } from "../../../domain/enums/consultationModes";
import { Gender } from "../../../domain/enums/gender";
import { PracticeType } from "../../../domain/enums/practiceType";
import { DoctorEducation } from "../../../domain/types/doctorEducationType";
import { DoctorExperience } from "../../../domain/types/doctorExperienceType";
import { PracticeLocation } from "../../../domain/types/practiceLocation";

export interface doctorProfileBasicInfoDTO {
  name?: string;
  specialization: string;
  gender: Gender;
  dob: Date | undefined;
  phone: string;
  address: string;
  about?: string;
}

export interface doctorProfileEducationDTO {
  education: DoctorEducation[];
}

export interface doctorProfileExperienceDTO {
  experience: DoctorExperience[];
}

export interface doctorOnboardingStep6DTO {
  acceptedTerms: boolean;
  submissionDate: Date;
}

export interface doctorOnboardingStep4DTO {
  education: DoctorEducation[];
  experience: DoctorExperience[];
}

export interface doctorVerificationDocsDTO {
  medicalLicense: string;
  latestDegree: string;
}

export interface doctorSetupPracticeDTO {
  consultationFee?: number;
  consultationModes?: ConsultationModes[];
  practiceLocations?: PracticeLocation[];
  practiceType: PracticeType;
}

export interface doctorGetPracticeDetailsDTO {
  practiceType: PracticeType | null;
  practiceLocations: PracticeLocation[];
}

export interface updateBannerImageDTO {
  userId: string;
  action: "SET" | "REMOVE";
  imageKey?: string;
}
