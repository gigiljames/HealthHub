import { UGetProfileStage2DTO } from "../../../../APPLICATION/DTOs/user/userProfileCreationDTO";

export interface IUGetProfileStage2Usecase {
  execute(userId: string): Promise<UGetProfileStage2DTO>;
}
