import { UGetProfileStage2DTO } from "../../../../application/DTOs/user/userProfileCreationDTO";

export interface IUGetProfileStage2Usecase {
  execute(userId: string): Promise<UGetProfileStage2DTO | null>;
}
