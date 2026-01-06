import { doctorProfileEducationDTO } from "../../../../application/DTOs/doctor/doctorProfileDTO";

export interface IDProfileEducationUsecase {
  execute(
    data: doctorProfileEducationDTO,
    doctorId: string
  ): Promise<boolean | null>;
}
