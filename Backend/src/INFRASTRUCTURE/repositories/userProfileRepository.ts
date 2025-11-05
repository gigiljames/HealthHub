import { userProfileModel } from "../DB/models/userProfileModel";
import { IUserProfileRepository } from "../../domain/interfaces/repositories/IUserProfileRepository";
import UserProfile from "../../domain/entities/userProfile";
import { UserProfileMapper } from "../../application/mappers/userProfileMapper";

export class UserProfileRepository implements IUserProfileRepository {
  constructor() {}
  async findByUserId(userId: string): Promise<UserProfile | null> {
    const profileDoc = await userProfileModel.findOne({ userId });
    if (profileDoc) {
      return UserProfileMapper.toEntityFromDocument(profileDoc);
    }
    return null;
  }

  async save(profile: UserProfile): Promise<void> {
    if (profile.id) {
      await userProfileModel.findByIdAndUpdate(profile.id, {
        allegies: profile.allergies,
        bloodGroup: profile.bloodGroup,
        bodyMetrics: profile.bodyMetrics,
        contact: profile.contact,
        dob: profile.dob,
        gender: profile.gender,
        maritalStatus: profile.maritalStatus,
        occupation: profile.occupation,
        pastDiseases: profile.pastDiseases,
        pastSurgeries: profile.pastSurgeries,
        profileImageUrl: profile.profileImageUrl,
        updatedAt: profile.updatedAt,
      });
    } else {
      await userProfileModel.insertOne({
        userId: profile?.userId.toString(),
        allegies: profile.allergies,
        bloodGroup: profile.bloodGroup,
        bodyMetrics: profile.bodyMetrics,
        contact: profile.contact,
        dob: profile.dob,
        gender: profile.gender,
        maritalStatus: profile.maritalStatus,
        occupation: profile.occupation,
        pastDiseases: profile.pastDiseases,
        pastSurgeries: profile.pastSurgeries,
        profileImageUrl: profile.profileImageUrl,
        updatedAt: profile.updatedAt,
      });
    }
  }
}
