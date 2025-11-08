import { HProfileCreationStage4DTO } from "../../../../application/DTOs/hospital/hospitalProfileCreationDTO";

export interface IHProfileCreation4Usecase {
  execute(data: HProfileCreationStage4DTO): Promise<void>;
}
