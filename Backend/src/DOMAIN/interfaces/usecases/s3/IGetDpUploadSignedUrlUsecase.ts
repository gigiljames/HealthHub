import { UploadUrlDTO } from "../../../../application/DTOs/s3/uploadUrlDTO";

export interface IGetDpUploadSignedUrlUsecase {
  execute(
    filename: string,
    contentType: string,
    folder?: string
  ): Promise<UploadUrlDTO>;
}
