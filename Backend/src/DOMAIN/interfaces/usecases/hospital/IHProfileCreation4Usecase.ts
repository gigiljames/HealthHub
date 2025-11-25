import { HProfileCreation4DTO } from "../../../../application/DTOs/hospital/hospitalProfileCreationDTO";

export interface IHProfileCreation4Usecase {
  execute(data: HProfileCreation4DTO): Promise<void>;
}
