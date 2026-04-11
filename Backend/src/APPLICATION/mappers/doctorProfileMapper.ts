import DoctorProfile, {
  DoctorProfilePopulated,
  DoctorProfileSpecializationPopulated,
} from "../../domain/entities/doctorProfile";
import {
  IDoctorProfileDocument,
  IDoctorProfilePopulatedDocument,
  IDoctorProfileSpecializationPopulatedDocument,
} from "../../infrastructure/DB/models/doctorProfileModel";
import { AuthRepoMapper } from "../../infrastructure/repositories/mappers/authRepoMapper";
import {
  doctorProfileBasicInfoDTO,
  doctorProfileEducationDTO,
  doctorProfileExperienceDTO,
} from "../DTOs/doctor/doctorProfileDTO";
import { SpecializationMapper } from "./specializationMapper";

export class DoctorProfileMapper {
  static toEntityFromDocument(doc: IDoctorProfileDocument): DoctorProfile {
    return new DoctorProfile({
      id: doc._id?.toString(),
      doctorId: doc.doctorId.toString(),
      profileImageUrl: doc.profileImageUrl,
      bannerImageUrl: doc.bannerImageUrl,
      dob: doc.dob,
      gender: doc.gender,
      phone: doc.phone,
      address: doc.address,
      about: doc.about,
      education: doc.education,
      experience: doc.experience,
      specialization: doc.specialization?.toString(),
      certificates: doc.certificates,
      practiceType: doc.practiceType,
      practiceLocations: doc.practiceLocations,
      verificationStatus: doc.verificationStatus,
      verificationSubmissions: doc.verificationSubmissions,
      activeSubmissionId: doc.activeSubmissionId,
      acceptedTerms: doc.acceptedTerms,
      submissionDate: doc.submissionDate,
      isVisible: doc.isVisible,
    });
  }

  static toEntityFromSpecializationPopulatedDocument(
    doc: IDoctorProfileSpecializationPopulatedDocument,
  ): DoctorProfileSpecializationPopulated {
    return {
      id: doc._id?.toString() ?? "",
      doctorId: doc.doctorId.toString(),
      profileImageUrl: doc.profileImageUrl,
      bannerImageUrl: doc.bannerImageUrl,
      dob: doc.dob,
      gender: doc.gender,
      phone: doc.phone,
      address: doc.address,
      about: doc.about,
      education: doc.education,
      experience: doc.experience,
      specialization: doc.specialization
        ? SpecializationMapper.toEntityFromDocument(doc.specialization)
        : undefined,
      certificates: doc.certificates,
      practiceType: doc.practiceType,
      practiceLocations: doc.practiceLocations,
      verificationStatus: doc.verificationStatus,
      verificationSubmissions: doc.verificationSubmissions,
      activeSubmissionId: doc.activeSubmissionId,
      acceptedTerms: doc.acceptedTerms,
      submissionDate: doc.submissionDate,
      isVisible: doc.isVisible,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  static toEntityFromPopulatedDocument(
    doc: IDoctorProfilePopulatedDocument,
  ): DoctorProfilePopulated {
    return {
      id: doc._id?.toString() ?? "",
      doctorId: AuthRepoMapper.toEntityFromDocument(doc.doctorId),
      profileImageUrl: doc.profileImageUrl,
      bannerImageUrl: doc.bannerImageUrl,
      dob: doc.dob,
      gender: doc.gender,
      phone: doc.phone,
      address: doc.address,
      about: doc.about,
      education: doc.education,
      experience: doc.experience,
      specialization: SpecializationMapper.toEntityFromDocument(
        doc.specialization!,
      ),
      certificates: doc.certificates,
      practiceType: doc.practiceType,
      practiceLocations: doc.practiceLocations,
      verificationStatus: doc.verificationStatus,
      verificationSubmissions: doc.verificationSubmissions,
      activeSubmissionId: doc.activeSubmissionId,
      acceptedTerms: doc.acceptedTerms,
      submissionDate: doc.submissionDate,
      isVisible: doc.isVisible,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  static toBasicInfoDTO(
    entity: DoctorProfile,
    name: string,
  ): doctorProfileBasicInfoDTO {
    return {
      name: name,
      specialization:
        typeof entity.specialization === "string"
          ? entity.specialization
          : (entity.specialization?.name ?? ""),
      gender: entity.gender,
      dob: entity.dob || undefined,
      phone: entity.phone || "",
      address: entity.address || "",
      about: entity.about || "",
    };
  }

  static toEducationDTO(entity: DoctorProfile): doctorProfileEducationDTO {
    return {
      education: entity.education,
    };
  }

  static toExperienceDTO(entity: DoctorProfile): doctorProfileExperienceDTO {
    return {
      experience: entity.experience,
    };
  }
}
