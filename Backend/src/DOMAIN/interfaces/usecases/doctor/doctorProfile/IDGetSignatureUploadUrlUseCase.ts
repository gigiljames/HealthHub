import { UploadUrlDTO } from "../../../../../application/DTOs/s3/uploadUrlDTO";

export interface IDGetSignatureUploadUrlUseCase {
  execute(
    doctorId: string,
    fileName: string,
    contentType: string,
  ): Promise<UploadUrlDTO>;
}
