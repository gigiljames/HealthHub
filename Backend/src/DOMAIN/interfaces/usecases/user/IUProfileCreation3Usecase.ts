import { UProfileCreation3DTO } from "../../../../application/DTOs/user/userProfileCreationDTO";

export interface IUProfileCreation3Usecase {
  execute(data: UProfileCreation3DTO): Promise<void>;
}
