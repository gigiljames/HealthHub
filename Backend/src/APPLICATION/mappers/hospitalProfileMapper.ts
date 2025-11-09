import { HospitalProfile } from "../../domain/entities/hospitalProfile";
import { IHospitalProfileDocument } from "../../infrastructure/DB/models/hospitalProfileModel";
import {
  HGetProfileStage1DTO,
  HGetProfileStage2DTO,
  HGetProfileStage3DTO,
  HGetProfileStage4DTO,
  HGetProfileStage5DTO,
} from "../DTOs/hospital/hospitalProfileCreationDTO";

export class HospitalProfileMapper {
  static toEntityFromDocument(doc: IHospitalProfileDocument): HospitalProfile {
    return new HospitalProfile({
      id: JSON.stringify(doc._id),
      hospitalId: JSON.stringify(doc.hospitalId),
      type: doc.type,
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
    profile: HospitalProfile
  ): HGetProfileStage1DTO {
    return {
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
}
