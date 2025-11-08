import { HGetProfileStage2DTO } from "../../../../application/DTOs/hospital/hospitalProfileCreationDTO";

export interface IHGetProfileStage2Usecase {
  execute(hospitalId: string): Promise<HGetProfileStage2DTO>;
}
