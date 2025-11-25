import { HGetProfileStage1DTO } from "../../../../application/DTOs/hospital/hospitalProfileCreationDTO";

export interface IHGetProfileStage1Usecase {
  execute(hospitalId: string): Promise<HGetProfileStage1DTO | null>;
}
