import { IDGetBannerImageAccessUrlUsecase } from "../../../../domain/interfaces/usecases/doctor/doctorProfile/IDGetBannerImageAccessUrlUsecase";
import { IDoctorProfileRepository } from "../../../../domain/interfaces/repositories/IDoctorProfileRepository";
import { IS3Service } from "../../../../domain/interfaces/services/IS3Service";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../../domain/constants/messages";

export class DGetBannerImageAccessUrlUsecase implements IDGetBannerImageAccessUrlUsecase {
  constructor(
    private _doctorProfileRepository: IDoctorProfileRepository,
    private _s3Service: IS3Service,
  ) {}
  async execute(doctorId: string): Promise<string> {
    const doctorProfile =
      await this._doctorProfileRepository.findByDoctorId(doctorId);
    if (!doctorProfile) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.PROFILE_NOT_FOUND,
      );
    }
    const bannerImageUrl = doctorProfile.bannerImageUrl;
    if (bannerImageUrl) {
      const bannerImageAccessUrl =
        await this._s3Service.getAccessSignedUrl(bannerImageUrl);
      return bannerImageAccessUrl;
    }
    return bannerImageUrl;
  }
}
