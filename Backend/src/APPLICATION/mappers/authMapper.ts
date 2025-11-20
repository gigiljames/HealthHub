import Auth from "../../domain/entities/auth";
import { IAuthDocument } from "../../infrastructure/DB/models/authModel";
import { GetUserProfileResponseDTO } from "../DTOs/admin/userManagementDTO";
import UserProfile from "../../domain/entities/userProfile";

export class AuthMapper {
  static toEntityFromDocument(doc: IAuthDocument): Auth {
    return new Auth({
      id: doc._id?.toString(),
      email: doc.email,
      name: doc.name,
      passwordHash: doc.passwordHash,
      googleId: doc.googleId,
      role: doc.role,
      isBlocked: doc.isBlocked,
      isNewUser: doc.isNewUser,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  static toAuthResponseDTOFromEntity(auth: Auth) {
    return {
      id: auth.id!,
      name: auth.name!,
      email: auth.email!,
      role: auth.role,
      isNewUser: auth.isNewUser,
    };
  }

  static toAdminUserListResponseDTOFromEntity(auth: Auth) {
    return {
      id: auth.id!,
      name: auth.name!,
      email: auth.email!,
      isBlocked: auth.isBlocked,
      isNewUser: auth.isNewUser,
    };
  }

  static toAdminUserProfileResponseDTO(
    authUser: Auth,
    userProfile: UserProfile | null
  ): GetUserProfileResponseDTO {
    const authData = {
      id: authUser.id!,
      name: authUser.name!,
      email: authUser.email!,
      isBlocked: authUser.isBlocked,
      isNewUser: authUser.isNewUser,
    };

    if (!userProfile) {
      // User hasn't completed profile creation yet, return auth data with default profile values
      return {
        ...authData,
        phone: "",
        bloodGroup: "",
        maritalStatus: "",
        dob: null,
        gender: "",
        occupation: "",
        profileImageUrl: null,
        allergies: [],
        bodyMetrics: {
          height: 0,
          weight: 0,
          lastUpdated: null,
        },
        contact: {
          address: "",
          phone: "",
        },
        pastDiseases: {
          bronchialAsthma: { value: false },
          epilepsy: { value: false },
          tuberculosis: { value: false },
        },
        pastSurgeries: [],
      };
    }

    return {
      ...authData,
      phone: userProfile.contact.phone,
      bloodGroup: userProfile.bloodGroup,
      maritalStatus: userProfile.maritalStatus,
      dob: userProfile.dob,
      gender: userProfile.gender,
      occupation: userProfile.occupation,
      profileImageUrl: userProfile.profileImageUrl,
      allergies: userProfile.allergies,
      bodyMetrics: userProfile.bodyMetrics,
      contact: {
        address: userProfile.contact.address,
        phone: userProfile.contact.phone,
      },
      pastDiseases: userProfile.pastDiseases,
      pastSurgeries: userProfile.pastSurgeries,
    };
  }
}
