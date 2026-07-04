import { Gender } from "../../../domain/enums/gender";
import { PracticeType } from "../../../domain/enums/practiceType";
import { VerificationStatus } from "../../../domain/enums/verificationStatus";
import { DoctorEducation } from "../../../domain/types/doctorEducationType";
import { DoctorExperience } from "../../../domain/types/doctorExperienceType";
import { PopulatedPracticeLocation } from "../../../domain/types/populatedPracticeLocation";
import { VerificationSubmission } from "../../../domain/types/verificationSubmission";
import { groupedSlotsByLocationAndDateDTO } from "../slot/slotDTO";

export interface GetDoctorsRequestDTO {
  search: string;
  page: number;
  limit: number;
  sort: string;
  rating: string;
  consultationModes: string[];
  languages: string[];
  gender: string;
  specialization: string;
  consultationFee?: number;
  location: number[];
  blocked?: boolean;
  unblocked?: boolean;
  newUser?: boolean;
}

export interface DoctorListItemDTO {
  id: string;
  name: string;
  profileImageUrl: string;
  specialization: string;
  consultationFee: number;
  rating: number;
  nextAvailableDate: string;
  consultationMode: string[];
  languages: string[];
  location: string;
}

export interface GetDoctorsResponseDTO {
  doctors: DoctorListItemDTO[];
  totalDocumentCount: number;
}

export interface GetDoctorPublicProfileDTO {
  id: string;
  name: string;
  specialization: string;
  profileImageUrl: string;
  bannerImageUrl: string;
  gender: Gender;
  contactEmail: string;
  contactPhone: string;
  languages: string[];
  education: DoctorEducation[];
  experience: DoctorExperience[];
  about: string;
  practiceLocations: PopulatedPracticeLocation[];
  slots: groupedSlotsByLocationAndDateDTO;
  practiceType: PracticeType;
  rating?: number;
  reviewCount?: number;
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
  isBlocked: boolean;
  isNewUser: boolean;
  profileImageUrl: string | null;
  bannerImageUrl: string | null;
  dob: Date | null;
  gender: Gender | string;
  phone: string;
  address: string;
  about: string;
  education: DoctorEducation[];
  experience: DoctorExperience[];
  specialization: string;
  certificates: {
    medicalLicense: string | null;
    latestDegree: string | null;
  };
  verificationStatus: VerificationStatus | string;
  verificationSubmissions: VerificationSubmission[];
  activeSubmissionId: string | null;
  isVisible: boolean;
  lastUpdated: Date | null;
  medicalRegistrationNumber?: string;
  signatureKey?: string;
  signatureUrl?: string;
}
