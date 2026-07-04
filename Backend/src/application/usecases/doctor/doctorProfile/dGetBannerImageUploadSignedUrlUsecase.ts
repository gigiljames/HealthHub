import { IDGetBannerImageUploadSignedUrlUsecase } from "../../../../domain/interfaces/usecases/doctor/doctorProfile/IDGetBannerImageUploadSignedUrlUsecase";
import { IS3Service } from "../../../../domain/interfaces/services/IS3Service";
import { UploadUrlDTO } from "../../../DTOs/s3/uploadUrlDTO";

export class DGetBannerImageUploadSignedUrlUsecase implements IDGetBannerImageUploadSignedUrlUsecase {
  constructor(private readonly _s3Service: IS3Service) {}

  async execute(
    doctorId: string,
    fileName: string,
    contentType: string,
  ): Promise<UploadUrlDTO> {
    if (!doctorId || !fileName || !contentType) {
      throw new Error("Doctor id, file name and content type are required");
    }

    const allowedPrefixes = ["image/"];
    if (!allowedPrefixes.some((p) => contentType.startsWith(p))) {
      throw new Error("Invalid content type. Only images are allowed.");
    }

    const folder = `uploads/banner-images/doctors/${doctorId}`;
    return await this._s3Service.getUploadSignedUrl(
      fileName,
      contentType,
      folder,
    );
  }
}
