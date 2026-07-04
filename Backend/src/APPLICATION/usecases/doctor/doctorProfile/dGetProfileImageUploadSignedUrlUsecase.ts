import { IDGetProfileImageUploadSignedUrlUsecase } from "../../../../domain/interfaces/usecases/doctor/doctorProfile/IDGetProfileImageUploadSignedUrlUsecase";
import { IS3Service } from "../../../../domain/interfaces/services/IS3Service";
import { UploadUrlDTO } from "../../../DTOs/s3/uploadUrlDTO";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../../domain/constants/messages";

export class DGetProfileImageUploadSignedUrlUsecase implements IDGetProfileImageUploadSignedUrlUsecase {
  constructor(private readonly _s3Service: IS3Service) {}

  async execute(
    doctorId: string,
    fileName: string,
    contentType: string,
  ): Promise<UploadUrlDTO> {
    if (!doctorId || !fileName || !contentType) {
      throw new CustomError(HttpStatusCodes.BAD_REQUEST, MESSAGES.BAD_REQUEST);
    }

    const allowedPrefixes = ["image/"];
    if (!allowedPrefixes.some((p) => contentType.startsWith(p))) {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        MESSAGES.INVALID_CONTENT_TYPE,
      );
    }

    const folder = `uploads/profile-images/doctors/${doctorId}`;
    return await this._s3Service.getUploadSignedUrl(
      fileName,
      contentType,
      folder,
    );
  }
}
