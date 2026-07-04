import { IDGetProfileImageAccessUrlUsecase } from "../../../../domain/interfaces/usecases/doctor/doctorProfile/IDGetProfileImageAccessUrlUsecase";
import { IS3Service } from "../../../../domain/interfaces/services/IS3Service";
import { IDoctorProfileRepository } from "../../../../domain/interfaces/repositories/IDoctorProfileRepository";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../../domain/constants/messages";

export class DGetProfileImageAccessUrlUsecase implements IDGetProfileImageAccessUrlUsecase {
  constructor(
    private readonly _doctorProfileRepository: IDoctorProfileRepository,
    private readonly _s3Service: IS3Service,
  ) {}
  async execute(doctorId: string): Promise<string> {
    const doctorProfile =
      await this._doctorProfileRepository.findByDoctorId(doctorId);
    if (!doctorProfile) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.DOCTOR.PROFILE_NOT_FOUND,
      );
    }
    const profileImageUrl = doctorProfile.profileImageUrl;
    if (profileImageUrl) {
      const profileImageAccessUrl =
        await this._s3Service.getAccessSignedUrl(profileImageUrl);
      return profileImageAccessUrl;
    }
    return profileImageUrl;
  }
}
