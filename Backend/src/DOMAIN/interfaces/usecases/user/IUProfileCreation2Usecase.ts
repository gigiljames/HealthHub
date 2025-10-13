import { UProfileCreation2DTO } from "../../../../APPLICATION/DTOs/user/userProfileCreationDTO";

export interface IUProfileCreation2Usecase {
  execute(data: UProfileCreation2DTO): Promise<void>;
}
