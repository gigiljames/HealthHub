import { doctorProfileExperienceDTO } from "../../../../application/DTOs/doctor/doctorProfileDTO";

export interface IDProfileExperienceUsecase {
  execute(
    data: doctorProfileExperienceDTO,
    doctorId: string
  ): Promise<boolean | null>;
}
