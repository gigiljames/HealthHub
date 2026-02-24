import { doctorOnboardingStep6DTO } from "../../../../../application/DTOs/doctor/doctorProfileDTO";

export interface IDOnboardingStep6Usecase {
  execute(data: doctorOnboardingStep6DTO & { userId: string }): Promise<void>;
}
