import { userProfileModel } from "../DB/models/userProfileModel";
import { IUserProfileRepository } from "../../domain/interfaces/repositories/IUserProfileRepository";
import UserProfile from "../../domain/entities/userProfile";
import { UserProfileMapper } from "../../application/mappers/userProfileMapper";
import { DemographicRaw } from "../../domain/interfaces/repositories/adminDashboardRepositoryTypes";

export class UserProfileRepository implements IUserProfileRepository {
  constructor() {}
  async findByUserId(userId: string): Promise<UserProfile | null> {
    const profileDoc = await userProfileModel.findOne({ userId });
    if (profileDoc) {
      return UserProfileMapper.toEntityFromDocument(profileDoc);
    }
    return null;
  }

  async save(profile: UserProfile): Promise<UserProfile> {
    if (profile.id) {
      await userProfileModel.findByIdAndUpdate(profile.id, {
        allergies: profile.allergies,
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
      return profile;
    } else {
      const profileDoc = await userProfileModel.insertOne({
        userId: profile?.userId.toString(),
        allergies: profile.allergies,
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
      return UserProfileMapper.toEntityFromDocument(profileDoc);
    }
  }
  async getGenderDemographics(): Promise<DemographicRaw[]> {
    return await userProfileModel.aggregate([
      {
        $group: {
          _id: "$gender",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          label: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);
  }

  async getAgeDemographics(): Promise<DemographicRaw[]> {
    return await userProfileModel.aggregate([
      {
        $addFields: {
          age: {
            $dateDiff: {
              startDate: "$dob",
              endDate: "$$NOW",
              unit: "year",
            },
          },
        },
      },
      {
        $bucket: {
          groupBy: "$age",
          boundaries: [0, 19, 36, 51, 66, 120],
          default: "Unknown",
          output: {
            count: { $sum: 1 },
          },
        },
      },
      {
        $project: {
          label: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id", 0] }, then: "0-18" },
                { case: { $eq: ["$_id", 19] }, then: "19-35" },
                { case: { $eq: ["$_id", 36] }, then: "36-50" },
                { case: { $eq: ["$_id", 51] }, then: "51-65" },
                { case: { $eq: ["$_id", 66] }, then: "66+" },
              ],
              default: "Unknown",
            },
          },
          count: 1,
          _id: 0,
        },
      },
    ]);
  }
}
