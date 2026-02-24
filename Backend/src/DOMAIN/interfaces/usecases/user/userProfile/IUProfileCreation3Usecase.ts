import { UProfileCreation3DTO } from "../../../../../application/DTOs/user/userProfileDTO";

export interface IUProfileCreation3Usecase {
  execute(data: UProfileCreation3DTO): Promise<void>;
}
