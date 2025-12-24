import UserProfile from "../../domain/entities/userProfile";
import { Contact } from "../../domain/types/contactType";
import { IUserProfileDocument } from "../../infrastructure/DB/models/userProfileModel";
import {
  UGetProfileStage1DTO,
  UGetProfileStage2DTO,
  UGetProfileStage3DTO,
  UGetProfileStage4DTO,
} from "../DTOs/user/userProfileCreationDTO";

export class UserProfileMapper {
  static toEntityFromDocument(doc: IUserProfileDocument): UserProfile {
    return new UserProfile({
      id: doc._id?.toString(),
      userId: doc.userId.toString(),
      allergies: doc.allergies,
      bloodGroup: doc.bloodGroup,
      bodyMetrics: doc.bodyMetrics,
      contact: doc.contact as Contact,
      dob: doc.dob,
      gender: doc.gender,
      maritalStatus: doc.maritalStatus,
      occupation: doc.occupation,
      pastDiseases: doc.pastDiseases,
      pastSurgeries: doc.pastSurgeries,
      profileImageUrl: doc.profileImageUrl,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  static toGetProfileStage1DTOFromEntity(
    profile: UserProfile,
    name: string
  ): UGetProfileStage1DTO {
    return {
      name,
      dob: profile.dob,
      allergies: profile.allergies,
      bloodGroup: profile.bloodGroup,
      gender: profile.gender,
      maritalStatus: profile.maritalStatus,
      occupation: profile.occupation,
    };
  }

  static toGetProfileStage2DTOFromEntity(
    profile: UserProfile
  ): UGetProfileStage2DTO {
    return {
      address: profile.contact.address,
      phoneNumber: profile.contact.phone,
      height: profile.bodyMetrics.height,
      weight: profile.bodyMetrics.weight,
    };
  }

  static toGetProfileStage3DTOFromEntity(
    profile: UserProfile
  ): UGetProfileStage3DTO {
    return {
      bronchialAsthma: profile.pastDiseases.bronchialAsthma.value,
      epilepsy: profile.pastDiseases.epilepsy.value,
      tb: profile.pastDiseases.tuberculosis.value,
    };
  }

  static toGetProfileStage4DTOFromEntity(
    profile: UserProfile
  ): UGetProfileStage4DTO {
    return {
      surgeries: profile.pastSurgeries,
    };
  }
}
