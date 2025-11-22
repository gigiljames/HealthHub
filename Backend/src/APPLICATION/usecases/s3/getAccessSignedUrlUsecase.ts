import { IS3Service } from "../../../domain/interfaces/services/IS3Service";
import { IGetAccessSignedUrlUsecase } from "../../../domain/interfaces/usecases/s3/IGetAccessSignedUrlUsecase";

export class GetAccessSignedUrlUseCase implements IGetAccessSignedUrlUsecase {
  constructor(private s3Service: IS3Service) {}

  async execute(key: string) {
    if (!key) throw new Error("File key is required");
    return await this.s3Service.getAccessSignedUrl(key);
  }
}
