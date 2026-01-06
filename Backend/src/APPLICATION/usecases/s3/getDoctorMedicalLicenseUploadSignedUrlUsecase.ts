import { UploadUrlDTO } from "../../DTOs/s3/uploadUrlDTO";
import { IS3Service } from "../../../domain/interfaces/services/IS3Service";
import { IGetDoctorMedicalLicenseUploadSignedUrlUsecase } from "../../../domain/interfaces/usecases/s3/IGetDoctorMedicalLicenseUploadSignedUrlUsecase";

export class GetDoctorMedicalLicenseUploadSignedUrlUseCase
  implements IGetDoctorMedicalLicenseUploadSignedUrlUsecase
{
  constructor(private _s3Service: IS3Service) {}

  async execute(
    doctorId: string,
    fileName: string,
    contentType: string
  ): Promise<UploadUrlDTO> {
    if (!doctorId || !fileName || !contentType) {
      throw new Error("Doctor id, file name and content type are required");
    }

    const allowedPrefixes = ["image/", "application/pdf"];
    if (!allowedPrefixes.some((p) => contentType.startsWith(p))) {
      throw new Error(
        "Invalid content type. Only images and PDFs are allowed."
      );
    }

    const folder = `uploads/doctor-documents/medical-license/${doctorId}`;
    return await this._s3Service.getUploadSignedUrl(
      fileName,
      contentType,
      folder
    );
  }
}
