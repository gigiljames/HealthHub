import { hospitalProfileModel } from "../DB/models/hospitalProfileModel";
import { IHospitalProfileRepository } from "../../domain/interfaces/repositories/IHospitalProfileRepository";
import { HospitalProfile } from "../../domain/entities/hospitalProfile";
import { HospitalProfileMapper } from "../../application/mappers/hospitalProfileMapper";

export class HospitalProfileRepository implements IHospitalProfileRepository {
  constructor() {}

  async findByHospitalId(hospitalId: string): Promise<HospitalProfile | null> {
    const profileDoc = await hospitalProfileModel.findOne({ hospitalId });
    if (profileDoc) {
      return HospitalProfileMapper.toEntityFromDocument(profileDoc);
    }
    return null;
  }

  async save(profile: HospitalProfile): Promise<void> {
    if (profile.id) {
      await hospitalProfileModel.findByIdAndUpdate(profile.id, {
        hospitalId: profile.hospitalId,
        type: profile.type,
        location: profile.location,
        profileImageUrl: profile.profileImageUrl,
        bannerImageUrl: profile.bannerImageUrl,
        certificates: profile.certificates,
        features: profile.features,
        contact: profile.contact,
        isVisible: profile.isVisible,
        lastUpdated: profile.lastUpdated,
        verificationStatus: profile.verificationStatus,
        verificationRemarks: profile.verificationRemarks,
        updatedAt: new Date(),
      });
    } else {
      await hospitalProfileModel.insertMany([
        {
          hospitalId: profile.hospitalId,
          type: profile.type,
          location: profile.location,
          profileImageUrl: profile.profileImageUrl,
          bannerImageUrl: profile.bannerImageUrl,
          certificates: profile.certificates,
          features: profile.features,
          contact: profile.contact,
          isVisible: profile.isVisible,
          lastUpdated: profile.lastUpdated,
          verificationStatus: profile.verificationStatus,
          verificationRemarks: profile.verificationRemarks,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
    }
  }
}
