import { UGetProfileStage3DTO } from "../../../../application/DTOs/user/userProfileCreationDTO";

export interface IUGetProfileStage3Usecase {
  execute(userId: string): Promise<UGetProfileStage3DTO | null>;
}
