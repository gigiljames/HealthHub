import { UProfileCreation1DTO } from "../../../../APPLICATION/DTOs/user/userProfileCreationDTO";
import UserProfile from "../../../entities/userProfile";

export interface IUProfileCreation1Usecase {
  execute(data: UProfileCreation1DTO): Promise<void>;
}
