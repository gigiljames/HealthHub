import { doctorProfileEducationDTO } from "../../../../application/DTOs/doctor/doctorProfileDTO";

export interface IDGetProfileEducationUsecase {
  execute(doctorId: string): Promise<doctorProfileEducationDTO | null>;
}
