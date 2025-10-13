import { UGetProfileStage3DTO } from "../../../../APPLICATION/DTOs/user/userProfileCreationDTO";

export interface IUGetProfileStage3Usecase {
  execute(userId: string): Promise<UGetProfileStage3DTO>;
}
