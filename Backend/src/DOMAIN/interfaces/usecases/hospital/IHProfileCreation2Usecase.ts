import { HProfileCreation2DTO } from "../../../../application/DTOs/hospital/hospitalProfileCreationDTO";

export interface IHProfileCreation2Usecase {
  execute(data: HProfileCreation2DTO): Promise<void>;
}
