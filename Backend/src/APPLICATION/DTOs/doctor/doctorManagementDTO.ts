import { Gender } from "../../../domain/enums/gender";
import { VerificationStatus } from "../../../domain/enums/verificationStatus";
import { DoctorEducation } from "../../../domain/types/doctorEducationType";
import { DoctorExperience } from "../../../domain/types/doctorExperienceType";

export interface GetDoctorsRequestDTO {
  search: string;
  page: number;
  limit: number;
  sort: string;
  blocked?: boolean;
  unblocked?: boolean;
  newUser?: boolean;
}

export interface DoctorListItemDTO {
  id: string;
  name: string;
  email: string;
  isBlocked: boolean;
  isNewUser: boolean;
}

export interface GetDoctorsResponseDTO {
  doctors: DoctorListItemDTO[];
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
