import { Gender } from "../../../domain/enums/gender";
import { VerificationStatus } from "../../../domain/enums/verificationStatus";
import { DoctorEducation } from "../../../domain/types/doctorEducationType";
import { DoctorExperience } from "../../../domain/types/doctorExperienceType";

export interface GetDoctorsRequestDTO {
  search: string;
  page: number;
  limit: number;
  sort: string;
  rating: string;
  consultationMode: string[];
  languages: string[];
  gender: string;
  specialization: string;
  location: number[];
  blocked?: boolean;
  unblocked?: boolean;
  newUser?: boolean;
}

export interface DoctorListItemDTO {
  id: string;
  name: string;
  specialization: string;
  consultationFee: number;
  rating: number;
  nextAvailableDate: string;
  consultationMode: string[];
  languages: string[];
  location: string;
  profileImageUrl: string;
}

export interface GetDoctorsResponseDTO {
  doctors: DoctorListItemDTO[];
  totalDocumentCount: number;
}

export interface GetAllDoctorsRequestDTO {
  search: string;
  page: number;
  limit: number;
  sort: string;
  blocked?: boolean;
  unblocked?: boolean;
  newUser?: boolean;
}

export interface AllDoctorListItemDTO {
  id: string;
  name: string;
  email: string;
  isBlocked: boolean;
  isNewUser: boolean;
}

export interface GetAllDoctorsResponseDTO {
  doctors: AllDoctorListItemDTO[];
  totalDocumentCount: number;
}

export interface GetDoctorProfileResponseDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  isBlocked: boolean;
  isNewUser: boolean;
  profileImageUrl: string | null;
  bannerImageUrl: string | null;
  gender: Gender | string;
  dob: Date | null;
  specialization: string;
  about: string;
  verificationStatus: VerificationStatus | string;
  verificationRemarks: string | null;
  education: DoctorEducation[];
  experience: DoctorExperience[];
  independentFee: number;
  isVisible: boolean;
  lastUpdated: Date | null;
}
