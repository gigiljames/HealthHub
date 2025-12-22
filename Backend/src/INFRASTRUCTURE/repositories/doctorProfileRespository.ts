import DoctorProfile, {
  DoctorProfilePopulated,
} from "../../domain/entities/doctorProfile";
import {
  DoctorProfileModel,
  IDoctorProfilePopulatedDocument,
} from "../DB/models/doctorProfileModel";
import { IDoctorProfileRepository } from "../../domain/interfaces/repositories/IDoctorRepository";
import { DoctorProfileMapper } from "../../application/mappers/doctorProfileMapper";

export class DoctorProfileRepository implements IDoctorProfileRepository {
  constructor() {}

  async findByDoctorId(doctorId: string): Promise<DoctorProfile | null> {
    const profile = await DoctorProfileModel.findOne({ doctorId });
    if (!profile) return null;
    return DoctorProfileMapper.toEntityFromDocument(profile);
  }

  async findByDoctorIdPopulated(
    doctorId: string
  ): Promise<DoctorProfilePopulated | null> {
    const profile = (await DoctorProfileModel.findOne({ doctorId }).populate(
      "specialization"
    )) as IDoctorProfilePopulatedDocument;
    if (!profile) return null;
    return DoctorProfileMapper.toEntityFromPopulatedDocument(profile);
  }

  async save(profile: DoctorProfile): Promise<void> {
    if (profile.id) {
      await DoctorProfileModel.findByIdAndUpdate(profile.id, {
        doctorId: profile.doctorId,
        profileImageUrl: profile.profileImageUrl,
        bannerImageUrl: profile.bannerImageUrl,
        dob: profile.dob,
        gender: profile.gender,
        phone: profile.phone,
        address: profile.address,
        about: profile.about,
        independentFee: profile.independentFee,
        education: profile.education,
        experience: profile.experience,
        availability: profile.availability,
        location: profile.location,
        specialization: profile.specialization,
        certificates: profile.certificates,
        hospitalId: profile.hospitalId,
        verificationStatus: profile.verificationStatus,
        verificationRemarks: profile.verificationRemarks,
        acceptedTerms: profile.acceptedTerms,
        submissionDate: profile.submissionDate,
        isVisible: profile.isVisible,
        updatedAt: new Date(),
      });
    } else {
      await DoctorProfileModel.create({
        doctorId: profile.doctorId,
        profileImageUrl: profile.profileImageUrl,
        bannerImageUrl: profile.bannerImageUrl,
        dob: profile.dob,
        gender: profile.gender,
        phone: profile.phone,
        address: profile.address,
        about: profile.about,
        independentFee: profile.independentFee,
        education: profile.education,
        experience: profile.experience,
        availability: profile.availability,
        location: profile.location,
        specialization: profile.specialization,
        certificates: profile.certificates,
        hospitalId: profile.hospitalId,
        verificationStatus: profile.verificationStatus,
        verificationRemarks: profile.verificationRemarks,
        acceptedTerms: profile.acceptedTerms,
        submissionDate: profile.submissionDate,
        isVisible: profile.isVisible,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }
}
