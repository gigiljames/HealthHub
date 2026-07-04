import { UploadUrlDTO } from "../../../../../application/DTOs/s3/uploadUrlDTO";

export interface IDGetProfileImageUploadSignedUrlUsecase {
  execute(
    doctorId: string,
    fileName: string,
    contentType: string,
  ): Promise<UploadUrlDTO>;
}
