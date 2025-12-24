import { UploadUrlDTO } from "../../../../application/DTOs/s3/uploadUrlDTO";

export interface IGetDoctorDegreeCertificateUploadSignedUrlUsecase {
  execute(
    doctorId: string,
    fileName: string,
    contentType: string
  ): Promise<UploadUrlDTO>;
}
