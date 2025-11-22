import { HGetProfileStage5DTO } from "../../../../application/DTOs/hospital/hospitalProfileCreationDTO";

export interface IHGetProfileStage5Usecase {
  execute(hospitalId: string): Promise<HGetProfileStage5DTO | null>;
}
