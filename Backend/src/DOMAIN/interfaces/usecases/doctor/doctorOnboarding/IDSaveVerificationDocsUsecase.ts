export interface IDSaveVerificationDocsUsecase {
  execute(
    doctorId: string,
    medicalLicenseKey: string,
    degreeCertificateKey: string,
  ): Promise<void>;
}
