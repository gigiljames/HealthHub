import DoctorProfile, {
  DoctorProfilePopulated,
} from "../../domain/entities/doctorProfile";
import {
  IDoctorProfileDocument,
  IDoctorProfilePopulatedDocument,
} from "../../infrastructure/DB/models/doctorProfileModel";
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
      independentFee: doc.independentFee,
      education: doc.education,
      experience: doc.experience,
      availability: doc.availability,
      location: doc.location,
      specialization: doc.specialization?.toString(),
      certificates: doc.certificates,
      hospitalId: doc.hospitalId?.toString(),
      verificationStatus: doc.verificationStatus,
      verificationRemarks: doc.verificationRemarks,
      acceptedTerms: doc.acceptedTerms,
      submissionDate: doc.submissionDate,
      isVisible: doc.isVisible,
    });
  }

  static toEntityFromPopulatedDocument(
    doc: IDoctorProfilePopulatedDocument
  ): DoctorProfilePopulated {
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
      independentFee: doc.independentFee,
      education: doc.education,
      experience: doc.experience,
      availability: doc.availability,
      location: doc.location,
      specialization: doc.specialization
        ? SpecializationMapper.toEntityFromDocument(doc.specialization)
        : undefined,
      certificates: doc.certificates,
      hospitalId: doc.hospitalId?.toString(),
      verificationStatus: doc.verificationStatus,
      verificationRemarks: doc.verificationRemarks,
      acceptedTerms: doc.acceptedTerms,
      submissionDate: doc.submissionDate,
      isVisible: doc.isVisible,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  static toBasicInfoDTO(
    entity: DoctorProfile,
    name: string
  ): doctorProfileBasicInfoDTO {
    return {
      name: name,
      specialization:
        typeof entity.specialization === "string"
          ? entity.specialization
          : entity.specialization?.name ?? "",
      gender: entity.gender,
      dob: entity.dob || undefined,
      phone: entity.phone || "",
      address: entity.address || "",
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
