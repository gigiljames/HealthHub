import { User } from "../../entities/user";
import UserProfile from "../../entities/userProfile";

export interface IUserProfileRepository {
  findByUserId(userId: string): Promise<UserProfile>;
  save(profile: UserProfile): Promise<void>;
}
