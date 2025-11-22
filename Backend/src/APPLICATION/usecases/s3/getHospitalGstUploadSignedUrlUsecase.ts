import { UploadUrlDTO } from "../../DTOs/s3/uploadUrlDTO";
import { IS3Service } from "../../../domain/interfaces/services/IS3Service";
import { IGetHospitalGstUploadSignedUrlUsecase } from "../../../domain/interfaces/usecases/s3/IGetHospitalGstUploadSignedUrlUsecase";

export class GetHospitalGstUploadSignedUrlUseCase
  implements IGetHospitalGstUploadSignedUrlUsecase
{
  constructor(private _s3Service: IS3Service) {}

  async execute(
    hospitalId: string,
    fileName: string,
    contentType: string
  ): Promise<UploadUrlDTO> {
    if (!hospitalId || !fileName || !contentType) {
      throw new Error("Hospital id, file name and content type are required");
    }

    const allowedPrefixes = ["image/", "application/pdf"];
    if (!allowedPrefixes.some((p) => contentType.startsWith(p))) {
      throw new Error(
        "Invalid content type. Only images and PDFs are allowed."
      );
    }

    const folder = `uploads/hospital-certificates/gst/${hospitalId}`;
    return await this._s3Service.getUploadSignedUrl(
      fileName,
      contentType,
      folder
    );
  }
}
