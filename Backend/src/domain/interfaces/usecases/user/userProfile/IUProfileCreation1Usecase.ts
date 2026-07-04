import { UProfileCreation1DTO } from "../../../../../application/DTOs/user/userProfileDTO";

export interface IUProfileCreation1Usecase {
  execute(data: UProfileCreation1DTO): Promise<void>;
}
