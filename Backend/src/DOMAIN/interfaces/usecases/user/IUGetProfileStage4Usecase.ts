import { UGetProfileStage4DTO } from "../../../../application/DTOs/user/userProfileCreationDTO";

export interface IUGetProfileStage4Usecase {
  execute(userId: string): Promise<UGetProfileStage4DTO | null>;
}
