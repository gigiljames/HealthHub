export interface GetHospitalsRequestDTO {
  search: string;
  page: number;
  limit: number;
  sort: string;
  blocked?: boolean;
  unblocked?: boolean;
  verified?: boolean;
  notVerified?: boolean;
  newUser?: boolean;
  profileCompleted?: boolean;
}

export interface HospitalListItemDTO {
  id: string;
  name: string;
  email: string;
  isBlocked: boolean;
  isVerified: boolean;
  verificationStatus: string;
  verificationRemarks: string;
  profileCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetHospitalsResponseDTO {
  hospitals: HospitalListItemDTO[];
  totalDocumentCount: number;
}

export interface HospitalProfileDTO {
  id: string;
  name: string;
  email: string;
  role: string;
  isBlocked: boolean;
  isVerified: boolean;
  profile: {
    id: string;
    about: string | undefined;
    type: string;
    establishedYear: number | undefined;
    location: number[];
    profileImageUrl: string;
    bannerImageUrl: string;
    certificates: Record<string, unknown>;
    features: string[];
    contact: Record<string, unknown>;
    isVisible: boolean;
    lastUpdated: Date | undefined;
    verificationStatus: string;
    verificationRemarks: string;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface HospitalProfileDetailsDTO {
  id: string;
  name: string;
  email: string;
  isBlocked: boolean;
  isNewUser: boolean;
  verificationStatus: string;
  verificationRemarks: string | null;
  profile: {
    id: string | undefined;
    hospitalId: string | undefined;
    type: string | undefined;
    location: number[] | undefined;
    profileImageUrl: string | undefined;
    bannerImageUrl: string | undefined;
    about: string | undefined;
    establishedYear: number | undefined;
    certificates: unknown;
    features: string[] | undefined;
    contact: unknown;
    isVisible: boolean | undefined;
    lastUpdated: Date | undefined;
  };
}
