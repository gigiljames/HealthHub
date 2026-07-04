import { doctorOnboardingStep4DTO } from "../../../../../application/DTOs/doctor/doctorProfileDTO";

export interface IDOnboardingStep4Usecase {
  execute(doctorId: string, data: doctorOnboardingStep4DTO): Promise<void>;
}
