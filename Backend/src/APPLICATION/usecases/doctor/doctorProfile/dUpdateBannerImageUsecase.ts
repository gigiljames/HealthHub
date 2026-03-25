import { MESSAGES } from "../../../../domain/constants/messages";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { IDoctorProfileRepository } from "../../../../domain/interfaces/repositories/IDoctorProfileRepository";
import { IDUpdateBannerImageUsecase } from "../../../../domain/interfaces/usecases/doctor/doctorProfile/IDUpdateBannerImageUsecase";
import { updateBannerImageDTO } from "../../../DTOs/doctor/doctorProfileDTO";

export class DUpdateBannerImageUsecase implements IDUpdateBannerImageUsecase {
  constructor(private _doctorProfileRepository: IDoctorProfileRepository) {}
  async execute(data: updateBannerImageDTO): Promise<void> {
    const doctorProfile = await this._doctorProfileRepository.findByDoctorId(
      data.userId,
    );
    if (!doctorProfile) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.DOCTOR.PROFILE_NOT_FOUND,
      );
    }
    if (data.action === "SET") {
      doctorProfile.bannerImageUrl = data.imageKey!;
    } else if (data.action === "REMOVE") {
      doctorProfile.bannerImageUrl = "";
      // S3 CLEANUP HERE
    }
    await this._doctorProfileRepository.save(doctorProfile);
  }
}
