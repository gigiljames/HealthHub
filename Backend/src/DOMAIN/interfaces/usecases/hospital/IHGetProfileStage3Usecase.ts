import { HGetProfileStage3DTO } from "../../../../application/DTOs/hospital/hospitalProfileCreationDTO";

export interface IHGetProfileStage3Usecase {
  execute(hospitalId: string): Promise<HGetProfileStage3DTO>;
}
