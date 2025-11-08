import { HProfileCreationStage2DTO } from "../../../../application/DTOs/hospital/hospitalProfileCreationDTO";

export interface IHProfileCreation2Usecase {
  execute(data: HProfileCreationStage2DTO): Promise<void>;
}
