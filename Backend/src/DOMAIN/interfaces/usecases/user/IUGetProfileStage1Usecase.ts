import { UGetProfileStage1DTO } from "../../../../application/DTOs/user/userProfileCreationDTO";

export interface IUGetProfileStage1Usecase {
  execute(userId: string): Promise<UGetProfileStage1DTO | null>;
}
