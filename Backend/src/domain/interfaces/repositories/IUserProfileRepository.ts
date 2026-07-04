import UserProfile from "../../entities/userProfile";
import { DemographicRaw } from "./adminDashboardRepositoryTypes";

export interface IUserProfileRepository {
  findByUserId(userId: string): Promise<UserProfile | null>;
  save(profile: UserProfile): Promise<UserProfile>;
  getGenderDemographics(): Promise<DemographicRaw[]>;
  getAgeDemographics(): Promise<DemographicRaw[]>;
}
