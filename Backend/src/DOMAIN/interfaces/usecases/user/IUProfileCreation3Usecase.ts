import { UProfileCreation3DTO } from "../../../../APPLICATION/DTOs/user/userProfileCreationDTO";

export interface IUProfileCreation3Usecase {
  execute(data: UProfileCreation3DTO): Promise<void>;
}
