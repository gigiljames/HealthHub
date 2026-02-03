import { doctorSetupPracticeDTO } from "../../../../../application/DTOs/doctor/doctorProfileDTO";

export interface IDSetupPractice {
  execute(doctorId: string, data: doctorSetupPracticeDTO): Promise<void>;
}
