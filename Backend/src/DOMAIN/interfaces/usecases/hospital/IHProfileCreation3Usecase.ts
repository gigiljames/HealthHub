import { HProfileCreation3DTO } from "../../../../application/DTOs/hospital/hospitalProfileCreationDTO";

export interface IHProfileCreation3Usecase {
  execute(data: HProfileCreation3DTO): Promise<void>;
}
