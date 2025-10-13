import { UGetProfileStage1DTO } from "../../../../APPLICATION/DTOs/user/userProfileCreationDTO";

export interface IUGetProfileStage1Usecase {
  execute(userId: string): Promise<UGetProfileStage1DTO>;
}
