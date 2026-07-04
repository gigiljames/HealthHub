import { doctorGetPracticeDetailsDTO } from "../../../../../application/DTOs/doctor/doctorProfileDTO";

export interface IDGetPracticeDetails {
  execute(doctorId: string): Promise<doctorGetPracticeDetailsDTO>;
}
