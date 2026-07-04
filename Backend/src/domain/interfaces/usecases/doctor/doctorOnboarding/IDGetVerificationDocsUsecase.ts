import { doctorVerificationDocsDTO } from "../../../../../application/DTOs/doctor/doctorProfileDTO";

export interface IDGetVerificationDocsUsecase {
  execute(doctorId: string): Promise<doctorVerificationDocsDTO>;
}
