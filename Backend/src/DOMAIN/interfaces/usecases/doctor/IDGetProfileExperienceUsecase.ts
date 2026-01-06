import { doctorProfileExperienceDTO } from "../../../../application/DTOs/doctor/doctorProfileDTO";

export interface IDGetProfileExperienceUsecase {
  execute(doctorId: string): Promise<doctorProfileExperienceDTO | null>;
}
