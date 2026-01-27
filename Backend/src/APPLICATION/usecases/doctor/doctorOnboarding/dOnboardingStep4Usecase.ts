import { IDoctorProfileRepository } from "../../../../domain/interfaces/repositories/IDoctorProfileRepository";
import { IDOnboardingStep4Usecase } from "../../../../domain/interfaces/usecases/doctor/doctorOnboarding/IDOnboardingStep4Usecase";
import { doctorOnboardingStep4DTO } from "../../../DTOs/doctor/doctorProfileDTO";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../../domain/constants/messages";

export class DOnboardingStep4Usecase implements IDOnboardingStep4Usecase {
  constructor(private doctorProfileRepository: IDoctorProfileRepository) {}

  async execute(
    doctorId: string,
    data: doctorOnboardingStep4DTO,
  ): Promise<void> {
    const existingProfile =
      await this.doctorProfileRepository.findByDoctorId(doctorId);

    if (existingProfile) {
      existingProfile.experience = data.experience;
      existingProfile.education = data.education;
      await this.doctorProfileRepository.save(existingProfile);
    } else {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.SAVE_PROFILE_ERROR,
      );
    }
  }
}
