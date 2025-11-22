import { IS3Service } from "../../../domain/interfaces/services/IS3Service";
import { IGetHospitalRegistrationAccessSignedUrlUsecase } from "../../../domain/interfaces/usecases/s3/IGetHospitalRegistrationAccessSignedUrlUsecase";

export class GetHospitalRegistrationAccessSignedUrlUseCase
  implements IGetHospitalRegistrationAccessSignedUrlUsecase
{
  constructor(private _s3Service: IS3Service) {}

  async execute(hospitalId: string, fileName: string): Promise<string> {
    if (!hospitalId || !fileName) {
      throw new Error("Hospital id and file name are required");
    }

    const key = `uploads/hospital-certificates/registration/${hospitalId}/${fileName}`;
    return await this._s3Service.getAccessSignedUrl(key);
  }
}
