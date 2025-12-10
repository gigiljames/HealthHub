import { Gender } from "../../../domain/enums/gender";
import { DoctorEducation } from "../../../domain/types/doctorEducationType";
import { DoctorExperience } from "../../../domain/types/doctorExperienceType";

export interface doctorProfileBasicInfoDTO {
  name: string;
  specialization: string;
  gender: Gender;
  dob: Date | undefined;
  phone: string;
  address: string;
}

export interface doctorProfileEducationDTO {
  education: DoctorEducation[];
}

export interface doctorProfileExperienceDTO {
  experience: DoctorExperience[];
}

export interface doctorProfileStage5DTO {
  acceptedTerms: boolean;
  submissionDate: Date;
}
