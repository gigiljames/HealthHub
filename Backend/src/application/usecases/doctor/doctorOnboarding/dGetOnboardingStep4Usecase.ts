import { MESSAGES } from "../../../../domain/constants/messages";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { IDoctorProfileRepository } from "../../../../domain/interfaces/repositories/IDoctorProfileRepository";
import { IDGetOnboardingStep4Usecase } from "../../../../domain/interfaces/usecases/doctor/doctorOnboarding/IDGetOnboardingStep4Usecase";
import { doctorOnboardingStep4DTO } from "../../../DTOs/doctor/doctorProfileDTO";

export class DGetOnboardingStep4Usecase implements IDGetOnboardingStep4Usecase {
  constructor(
    private readonly _doctorProfileRepository: IDoctorProfileRepository,
  ) {}
  async execute(doctorId: string): Promise<doctorOnboardingStep4DTO> {
    const doctorProfile =
      await this._doctorProfileRepository.findByDoctorId(doctorId);
    if (!doctorProfile) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.SAVE_PROFILE_ERROR,
      );
    }
    return {
      education: doctorProfile.education,
      experience: doctorProfile.experience,
    };
  }
}
