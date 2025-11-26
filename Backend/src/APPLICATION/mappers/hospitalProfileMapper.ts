import { HospitalProfile } from "../../domain/entities/hospitalProfile";
import { IHospitalProfileDocument } from "../../infrastructure/DB/models/hospitalProfileModel";
import { IAuthDocument } from "../../infrastructure/DB/models/authModel";
import {
  HospitalListItemDTO,
  HospitalProfileDTO,
} from "../DTOs/admin/hospitalManagementDTO";
import { VerificationStatus } from "../../domain/enums/verificationStatus";
import { Roles } from "../../domain/enums/roles";
import {
  HGetProfileStage1DTO,
  HGetProfileStage2DTO,
  HGetProfileStage3DTO,
  HGetProfileStage4DTO,
  HGetProfileStage5DTO,
} from "../DTOs/hospital/hospitalProfileCreationDTO";

// Extend IAuthDocument to include _id and isVerified
type AuthDocumentWithId = IAuthDocument & {
  _id: string | { toString: () => string }; // Handle both string and ObjectId
  isVerified?: boolean;
};

export class HospitalProfileMapper {
  static toEntityFromDocument(doc: IHospitalProfileDocument): HospitalProfile {
    return new HospitalProfile({
      id: doc._id?.toString(),
      hospitalId: doc.hospitalId.toString(),
      about: doc.about,
      type: doc.type,
      establishedYear: doc.establishedYear,
      location: doc.location,
      profileImageUrl: doc.profileImageUrl,
      bannerImageUrl: doc.bannerImageUrl,
      certificates: doc.certificates,
      features: doc.features,
      contact: doc.contact,
      isVisible: doc.isVisible,
      lastUpdated: doc.lastUpdated,
      verificationStatus: doc.verificationStatus,
      verificationRemarks: doc.verificationRemarks,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  static toGetProfileStage1DTOFromEntity(
    profile: HospitalProfile,
    name: string | null
  ): HGetProfileStage1DTO {
    return {
      name: name ?? "",
      type: profile.type || "",
      establishedYear: profile.establishedYear,
      about: profile.about,
      profileImageUrl: profile.profileImageUrl || "",
    };
  }

  static toGetProfileStage2DTOFromEntity(
    profile: HospitalProfile
  ): HGetProfileStage2DTO {
    return {
      address: profile.contact?.address || "",
      phone: profile.contact?.phone || "",
      email: profile.contact?.email || "",
      website: profile.contact?.website || "",
      location: profile.location || [],
    };
  }

  static toGetProfileStage3DTOFromEntity(
    profile: HospitalProfile
  ): HGetProfileStage3DTO {
    return {
      hospitalRegistration: profile.certificates?.hospitalRegistration || "",
      gstCertificate: profile.certificates?.gstCertificate || "",
    };
  }

  static toGetProfileStage4DTOFromEntity(
    profile: HospitalProfile
  ): HGetProfileStage4DTO {
    return {
      features: profile.features || [],
    };
  }

  static toGetProfileStage5DTOFromEntity(
    profile: HospitalProfile
  ): HGetProfileStage5DTO {
    return {
      acceptedTerms: profile.acceptedTerms || false,
      submissionDate: profile.submissionDate || new Date(),
    };
  }

  static toHospitalListItemDTO(
    auth: AuthDocumentWithId,
    profile: HospitalProfile | null
  ): HospitalListItemDTO {
    return {
      id: auth._id?.toString() || "",
      email: auth.email,
      name: auth.name || "",
      isBlocked: auth.isBlocked || false,
      // isVerified: auth.isVerified || false,
      // verificationStatus:
      //   profile?.verificationStatus || VerificationStatus.pending,
      // verificationRemarks: profile?.verificationRemarks || "",
      // profileCompleted: !!profile,
      isNewUser: auth.isNewUser || false,
      // createdAt: auth.createdAt,
      // updatedAt: auth.updatedAt || new Date(),
    };
  }

  static toHospitalProfileDTO(
    auth: AuthDocumentWithId,
    profile: HospitalProfile | null
  ): HospitalProfileDTO {
    return {
      id: auth._id?.toString() || "",
      email: auth.email,
      name: auth.name || "",
      isBlocked: auth.isBlocked || false,
      isVerified: auth.isVerified || false,
      role: auth.role as Roles,
      profile: profile
        ? {
            id: profile.id || "",
            about: profile.about,
            type: profile.type || "",
            establishedYear: profile.establishedYear,
            location: profile.location || [],
            profileImageUrl: profile.profileImageUrl || "",
            bannerImageUrl: profile.bannerImageUrl || "",
            certificates: profile.certificates || {},
            features: profile.features || [],
            contact: profile.contact || {},
            isVisible: profile.isVisible || false,
            lastUpdated: profile.lastUpdated,
            verificationStatus:
              profile.verificationStatus || VerificationStatus.pending,
            verificationRemarks: profile.verificationRemarks || "",
            createdAt: profile.createdAt || new Date(),
            updatedAt: profile.updatedAt || new Date(),
          }
        : null,
      createdAt: auth.createdAt,
      updatedAt: auth.updatedAt,
    };
  }
}
