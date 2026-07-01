import { UGetFullProfileDTO } from "../../../../../application/DTOs/user/userProfileDTO";

export interface IUGetFullProfileUsecase {
  execute(userId: string): Promise<UGetFullProfileDTO | null>;
}
