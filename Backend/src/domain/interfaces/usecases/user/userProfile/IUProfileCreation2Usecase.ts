import { UProfileCreation2DTO } from "../../../../../application/DTOs/user/userProfileDTO";

export interface IUProfileCreation2Usecase {
  execute(data: UProfileCreation2DTO): Promise<void>;
}
