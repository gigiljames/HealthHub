import { UGetProfileStage4DTO } from "../../../../../application/DTOs/user/userProfileDTO";

export interface IUGetProfileStage4Usecase {
  execute(userId: string): Promise<UGetProfileStage4DTO | null>;
}
