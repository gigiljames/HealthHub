import { doctorProfileStage5DTO } from "../../../../application/DTOs/doctor/doctorProfileDTO";

export interface IDProfileCreation5Usecase {
  execute(data: doctorProfileStage5DTO & { userId: string }): Promise<void>;
}
