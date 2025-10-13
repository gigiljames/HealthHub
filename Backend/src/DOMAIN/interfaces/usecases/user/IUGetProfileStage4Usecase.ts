import { UGetProfileStage4DTO } from "../../../../APPLICATION/DTOs/user/userProfileCreationDTO";

export interface IUGetProfileStage4Usecase {
  execute(userId: string): Promise<UGetProfileStage4DTO>;
}
