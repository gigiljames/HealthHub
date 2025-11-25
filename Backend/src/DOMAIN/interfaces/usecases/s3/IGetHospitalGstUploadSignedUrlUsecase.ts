import { UploadUrlDTO } from "../../../../application/DTOs/s3/uploadUrlDTO";

export interface IGetHospitalGstUploadSignedUrlUsecase {
  execute(
    hospitalId: string,
    fileName: string,
    contentType: string
  ): Promise<UploadUrlDTO>;
}
