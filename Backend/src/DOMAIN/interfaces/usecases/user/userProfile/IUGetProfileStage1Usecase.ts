import { UGetProfileStage1DTO } from "../../../../../application/DTOs/user/userProfileDTO";

export interface IUGetProfileStage1Usecase {
  execute(userId: string): Promise<UGetProfileStage1DTO | null>;
}
