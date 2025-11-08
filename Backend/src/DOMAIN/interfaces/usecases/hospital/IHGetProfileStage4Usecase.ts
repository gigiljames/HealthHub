import { HGetProfileStage4DTO } from "../../../../application/DTOs/hospital/hospitalProfileCreationDTO";

export interface IHGetProfileStage4Usecase {
  execute(hospitalId: string): Promise<HGetProfileStage4DTO>;
}
