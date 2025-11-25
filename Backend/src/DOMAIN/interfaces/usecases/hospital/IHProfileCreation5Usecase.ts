import { HProfileCreation5DTO } from "../../../../application/DTOs/hospital/hospitalProfileCreationDTO";

export interface IHProfileCreation5Usecase {
  execute(data: HProfileCreation5DTO): Promise<void>;
}
