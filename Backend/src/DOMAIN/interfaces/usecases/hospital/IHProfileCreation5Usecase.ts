import { HProfileCreationStage5DTO } from "../../../../application/DTOs/hospital/hospitalProfileCreationDTO";

export interface IHProfileCreation5Usecase {
  execute(data: HProfileCreationStage5DTO): Promise<void>;
}
