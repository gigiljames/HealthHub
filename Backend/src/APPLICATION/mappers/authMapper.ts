import Auth from "../../domain/entities/auth";
import { IAuthDocument } from "../../infrastructure/DB/models/authModel";
import { GetUserProfileResponseDTO } from "../DTOs/admin/userManagementDTO";
import { GetDoctorProfileResponseDTO } from "../DTOs/admin/doctorManagementDTO";
import UserProfile from "../../domain/entities/userProfile";
import DoctorProfile, {
  DoctorProfilePopulated,
} from "../../domain/entities/doctorProfile";
import { GetHospitalProfileResponseDTO } from "../DTOs/admin/hospitalManagementDTO";
import { HospitalProfile } from "../../domain/entities/hospitalProfile";

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

  static toAdminDoctorProfileResponseDTO(
    authUser: Auth,
    doctorProfile: DoctorProfilePopulated | null
  ): GetDoctorProfileResponseDTO {
    const authData = {
      id: authUser.id!,
      name: authUser.name!,
      email: authUser.email!,
      isBlocked: authUser.isBlocked,
      isNewUser: authUser.isNewUser,
    };

    if (!doctorProfile) {
      return {
        ...authData,
        phone: "",
        profileImageUrl: null,
        bannerImageUrl: null,
        gender: "",
        dob: null,
        specialization: "",
        about: "",
        verificationStatus: "",
        verificationRemarks: "",
        education: [],
        experience: [],
        independentFee: 0,
        isVisible: false,
        lastUpdated: null,
      };
    }

    return {
      ...authData,
      phone: doctorProfile.phone || "",
      profileImageUrl: doctorProfile.profileImageUrl,
      bannerImageUrl: doctorProfile.bannerImageUrl,
      gender: doctorProfile.gender,
      dob: doctorProfile.dob || null,
      specialization:
        typeof doctorProfile.specialization === "string"
          ? doctorProfile.specialization
          : doctorProfile.specialization?.name ?? "",
      about: doctorProfile.about || "",
      verificationStatus: doctorProfile.verificationStatus || "",
      verificationRemarks: doctorProfile.verificationRemarks || "",
      education: doctorProfile.education,
      experience: doctorProfile.experience,
      independentFee: doctorProfile.independentFee || 0,
      isVisible: doctorProfile.isVisible,
      lastUpdated: doctorProfile.updatedAt || null,
    };
  }

  static toAdminHospitalProfileResponseDTO(
    authUser: Auth,
    hospitalProfile: HospitalProfile | null
  ): GetHospitalProfileResponseDTO {
    const authData = {
      id: authUser.id!,
      name: authUser.name!,
      email: authUser.email!,
      isBlocked: authUser.isBlocked,
      isNewUser: authUser.isNewUser,
    };

    if (!hospitalProfile) {
      return {
        ...authData,
        profile: undefined,
      };
    }

    return {
      ...authData,
      profile: {
        type: hospitalProfile.type,
        establishedYear: hospitalProfile.establishedYear,
        about: hospitalProfile.about,
        location: hospitalProfile.location,
        profileImageUrl: hospitalProfile.profileImageUrl,
        bannerImageUrl: hospitalProfile.bannerImageUrl,
        certificates: hospitalProfile.certificates,
        features: hospitalProfile.features,
        contact: hospitalProfile.contact,
        verificationStatus: hospitalProfile.verificationStatus,
        verificationRemarks: hospitalProfile.verificationRemarks,
        lastUpdated: hospitalProfile.lastUpdated,
        acceptedTerms: hospitalProfile.acceptedTerms,
        submissionDate: hospitalProfile.submissionDate,
      },
    };
  }
}
