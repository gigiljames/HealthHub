import { UProfileCreation1DTO } from "../../../../application/DTOs/user/userProfileCreationDTO";

export interface IUProfileCreation1Usecase {
  execute(data: UProfileCreation1DTO): Promise<void>;
}
