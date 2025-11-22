import { IS3Service } from "../../../domain/interfaces/services/IS3Service";
import { IGetHospitalGstAccessSignedUrlUsecase } from "../../../domain/interfaces/usecases/s3/IGetHospitalGstAccessSignedUrlUsecase";

export class GetHospitalGstAccessSignedUrlUseCase
  implements IGetHospitalGstAccessSignedUrlUsecase
{
  constructor(private _s3Service: IS3Service) {}

  async execute(hospitalId: string, fileName: string): Promise<string> {
    if (!hospitalId || !fileName) {
      throw new Error("Hospital id and file name are required");
    }

    const key = `uploads/hospital-certificates/gst/${hospitalId}/${fileName}`;
    return await this._s3Service.getAccessSignedUrl(key);
  }
}
