import { doctorVerificationDocsDTO } from "../../../../../application/DTOs/doctor/doctorProfileDTO";

export interface IDSaveVerificationDocsUsecase {
  execute(
    doctorId: string,
    medicalLicenseKey: string | null,
    degreeCertificateKey: string | null,
  ): Promise<doctorVerificationDocsDTO>;
}
