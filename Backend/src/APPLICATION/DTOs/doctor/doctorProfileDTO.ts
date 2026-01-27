import { Gender } from "../../../domain/enums/gender";
import { DoctorEducation } from "../../../domain/types/doctorEducationType";
import { DoctorExperience } from "../../../domain/types/doctorExperienceType";

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
