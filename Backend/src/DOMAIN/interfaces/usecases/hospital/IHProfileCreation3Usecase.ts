import { HProfileCreationStage3DTO } from "../../../../application/DTOs/hospital/hospitalProfileCreationDTO";

export interface IHProfileCreation3Usecase {
  execute(data: HProfileCreationStage3DTO): Promise<void>;
}
