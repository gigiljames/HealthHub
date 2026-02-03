import { MESSAGES } from "../../../../domain/constants/messages";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { IDoctorProfileRepository } from "../../../../domain/interfaces/repositories/IDoctorProfileRepository";
import { IDUpdateProfileImageUsecase } from "../../../../domain/interfaces/usecases/doctor/doctorProfile/IDUpdateProfileImageUsecase";
import { updateProfileImageDTO } from "../../../DTOs/sharedDTO";

export class DUpdateProfileImageUsecase implements IDUpdateProfileImageUsecase {
  constructor(private _doctorProfileRepository: IDoctorProfileRepository) {}
  async execute(data: updateProfileImageDTO): Promise<void> {
    const doctorProfile = await this._doctorProfileRepository.findByDoctorId(
      data.userId,
    );
    if (!doctorProfile) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.SAVE_PROFILE_ERROR,
      );
    }
    if (data.action === "SET") {
      doctorProfile.profileImageUrl = data.imageKey!;
    } else if (data.action === "REMOVE") {
      doctorProfile.profileImageUrl = "";
      // S3 CLEANUP HERE
    }
    await this._doctorProfileRepository.save(doctorProfile);
  }
}
