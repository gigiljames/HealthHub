import { IS3Service } from "../../../domain/interfaces/services/IS3Service";
import { IGetDpUploadSignedUrlUsecase } from "../../../domain/interfaces/usecases/s3/IGetDpUploadSignedUrlUsecase";

export class GetDpUploadSignedUrlUseCase
  implements IGetDpUploadSignedUrlUsecase
{
  constructor(private _s3Service: IS3Service) {}

  async execute(fileName: string, contentType: string, folder?: string) {
    if (!fileName || !contentType) {
      throw new Error("File name and type are required");
    }
    return await this._s3Service.getUploadSignedUrl(
      fileName,
      contentType,
      folder
    );
  }
}
