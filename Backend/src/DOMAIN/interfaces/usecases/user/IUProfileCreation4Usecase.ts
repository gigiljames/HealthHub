import { UProfileCreation4DTO } from "../../../../application/DTOs/user/userProfileCreationDTO";

export interface IUProfileCreation4Usecase {
  execute(data: UProfileCreation4DTO): Promise<void>;
}
