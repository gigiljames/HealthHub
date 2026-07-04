import { UGetProfileStage3DTO } from "../../../../../application/DTOs/user/userProfileDTO";

export interface IUGetProfileStage3Usecase {
  execute(userId: string): Promise<UGetProfileStage3DTO | null>;
}
