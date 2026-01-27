import { doctorOnboardingStep4DTO } from "../../../../../application/DTOs/doctor/doctorProfileDTO";

export interface IDGetOnboardingStep4Usecase {
  execute(doctorId: string): Promise<doctorOnboardingStep4DTO>;
}
