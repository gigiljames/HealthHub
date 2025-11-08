import { HProfileCreationStage1DTO } from "../../../../application/DTOs/hospital/hospitalProfileCreationDTO";

export interface IHProfileCreation1Usecase {
  execute(data: HProfileCreationStage1DTO): Promise<void>;
}
