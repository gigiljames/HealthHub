import Auth from "../../domain/entities/auth";
import { IAuthDocument } from "../../infrastructure/DB/models/authModel";
import { GetUserProfileResponseDTO } from "../DTOs/user/userManagementDTO";
import { GetDoctorProfileResponseDTO } from "../DTOs/doctor/doctorManagementDTO";
import UserProfile from "../../domain/entities/userProfile";
import { AuthResponseDTO } from "../DTOs/auth/authDTO";
import { DoctorProfileSpecializationPopulated } from "../../domain/entities/doctorProfile";

export class AuthMapper {
  static toAuthResponseDTOFromEntity(auth: Auth): AuthResponseDTO {
    return {
      id: auth.id!,
      name: auth.name!,
      email: auth.email!,
      role: auth.role,
      isNewUser: auth.isNewUser,
      onboardingStep: auth.onboardingStep,
      authType: auth.googleId ? "GOOGLE" : "LOCAL",
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
    userProfile: UserProfile | null,
  ): GetUserProfileResponseDTO {
    const authData = {
      id: authUser.id!,
      name: authUser.name!,
      email: authUser.email!,
      isBlocked: authUser.isBlocked,
      isNewUser: authUser.isNewUser,
    };

    if (!userProfile) {
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
    doctorProfile: DoctorProfileSpecializationPopulated | null,
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
        address: "",
        profileImageUrl: null,
        bannerImageUrl: null,
        gender: "",
        dob: null,
        specialization: "",
        about: "",
        verificationStatus: "",
        verificationSubmissions: [],
        activeSubmissionId: "",
        certificates: {
          medicalLicense: null,
          latestDegree: null,
        },
        education: [],
        experience: [],
        isVisible: false,
        lastUpdated: null,
      };
    }

    return {
      ...authData,
      phone: doctorProfile.phone || "",
      address: doctorProfile.address || "",
      profileImageUrl: doctorProfile.profileImageUrl,
      bannerImageUrl: doctorProfile.bannerImageUrl,
      gender: doctorProfile.gender,
      dob: doctorProfile.dob || null,
      specialization:
        typeof doctorProfile.specialization === "string"
          ? doctorProfile.specialization
          : (doctorProfile.specialization?.name ?? ""),
      about: doctorProfile.about || "",
      verificationStatus: doctorProfile.verificationStatus || "",
      verificationSubmissions: doctorProfile.verificationSubmissions,
      activeSubmissionId: doctorProfile.activeSubmissionId,
      certificates: {
        medicalLicense: doctorProfile.certificates.medicalLicence || null,
        latestDegree: doctorProfile.certificates.latestDegree || null,
      },
      education: doctorProfile.education,
      experience: doctorProfile.experience,
      isVisible: doctorProfile.isVisible,
      lastUpdated: doctorProfile.updatedAt || null,
    };
  }
}
