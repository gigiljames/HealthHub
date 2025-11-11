export interface HGetProfileStage1DTO {
  type: string;
  establishedYear?: number;
  about?: string;
  profileImageUrl?: string;
}

export interface HGetProfileStage2DTO {
  address: string;
  phone: string;
  email: string;
  website?: string;
  location: number[];
}

export interface HGetProfileStage3DTO {
  hospitalRegistration: string;
  gstCertificate: string;
}

export interface HGetProfileStage4DTO {
  features: string[];
}

export interface HGetProfileStage5DTO {
  acceptedTerms: boolean;
  submissionDate: Date;
}

export interface HProfileCreation1DTO {
  hospitalId: string;
  type: string;
  establishedYear?: number;
  about?: string;
  profileImage?: Express.Multer.File;
}

export interface HProfileCreation2DTO {
  hospitalId: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  location?: number[];
  workingHours?: string;
}

export interface HProfileCreation3DTO {
  hospitalId: string;
  hospitalRegistration?: string;
  gstCertificate?: string;
}

export interface HProfileCreation4DTO {
  hospitalId: string;
  features: string[];
}

export interface HProfileCreation5DTO {
  hospitalId: string;
  acceptedTerms: boolean;
  submissionDate: Date;
}
