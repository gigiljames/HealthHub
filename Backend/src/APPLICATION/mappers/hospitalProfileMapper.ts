import { HospitalProfile } from "../../domain/entities/hospitalProfile";
import { IHospitalProfileDocument } from "../../INFRASTRUCTURE/DB/models/hospitalProfileModel";

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
}
