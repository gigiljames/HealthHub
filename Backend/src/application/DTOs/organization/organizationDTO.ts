export interface listOrganizationsDTO {
  id: string;
  name: string;
  address: string;
  organizationType: string;
}

export interface getOrganizationsRequestDTO {
  page?: number;
  limit?: number;
  search?: string;
  organizationType?: string;
  isBlocked?: boolean;
  verificationStatus?: "PENDING" | "VERIFIED" | "REJECTED";
}

export interface EnrolOrganizationRequestDTO {
  name: string;
  organizationType: string;
  location?: {
    coordinates: number[];
    address: string;
    placeId: string;
  };
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId?: string;
  email: string;
}

export interface ConfirmEnrolmentRequestDTO {
  email: string;
  otp: string;
  enrolData: EnrolOrganizationRequestDTO;
}

export interface ResubmitEnrolmentRequestDTO {
  email: string;
  otp: string;
  enrolData: EnrolOrganizationRequestDTO;
}

export interface OrganizationSubmissionDTO {
  submittedAt: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  rejectionReason?: string;
}

export interface OrganizationStatusResponseDTO {
  id: string;
  name: string;
  email: string;
  organizationType: string;
  location?: {
    coordinates: number[];
    address: string;
    placeId: string;
  };
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId?: string;
  isVerified: boolean;
  isBlocked: boolean;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  rejectionReason?: string;
  organizationCode?: string;
  submissionHistory?: OrganizationSubmissionDTO[];
}

export interface AdminOrganizationDetailsDTO {
  id: string;
  name: string;
  email: string;
  organizationType: string;
  location?: {
    type: "Point";
    coordinates: number[];
    address: string;
    placeId: string;
  };
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId?: string;
  isVerified: boolean;
  isBlocked: boolean;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  rejectionReason?: string;
  organizationCode?: string;
  submissionHistory?: OrganizationSubmissionDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminListOrganizationsResponseDTO {
  organizations: AdminOrganizationDetailsDTO[];
  total: number;
  pages: number;
}
