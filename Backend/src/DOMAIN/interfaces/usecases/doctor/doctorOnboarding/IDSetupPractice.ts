import { doctorSetupPracticeDTO } from "../../../../../application/DTOs/doctor/doctorProfileDTO";
import { PracticeLocation } from "../../../../types/practiceLocation";

export interface IDSetupPractice {
  execute(doctorId: string, data: doctorSetupPracticeDTO): Promise<PracticeLocation[]>;
}
