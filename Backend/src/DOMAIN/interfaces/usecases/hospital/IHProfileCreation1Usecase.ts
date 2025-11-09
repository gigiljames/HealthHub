import { HProfileCreation1DTO } from "../../../../application/DTOs/hospital/hospitalProfileCreationDTO";

export interface IHProfileCreation1Usecase {
  execute(data: HProfileCreation1DTO): Promise<void>;
}
