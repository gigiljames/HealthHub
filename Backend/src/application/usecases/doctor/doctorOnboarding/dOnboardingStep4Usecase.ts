import { IDoctorProfileRepository } from "../../../../domain/interfaces/repositories/IDoctorProfileRepository";
import { IDOnboardingStep4Usecase } from "../../../../domain/interfaces/usecases/doctor/doctorOnboarding/IDOnboardingStep4Usecase";
import { doctorOnboardingStep4DTO } from "../../../DTOs/doctor/doctorProfileDTO";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../../domain/constants/messages";
import { IAuthRepository } from "../../../../domain/interfaces/repositories/IAuthRepository";

export class DOnboardingStep4Usecase implements IDOnboardingStep4Usecase {
  constructor(
    private readonly _doctorProfileRepository: IDoctorProfileRepository,
    private readonly _authRepository: IAuthRepository,
  ) {}

  async execute(
    doctorId: string,
    data: doctorOnboardingStep4DTO,
  ): Promise<void> {
    const existingProfile =
      await this._doctorProfileRepository.findByDoctorId(doctorId);

    if (existingProfile) {
      existingProfile.experience = data.experience;
      existingProfile.education = data.education;
      await this._doctorProfileRepository.save(existingProfile);
    } else {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.SAVE_PROFILE_ERROR,
      );
    }
    const auth = await this._authRepository.findById(doctorId);
    if (!auth) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.USER_DOESNT_EXIST,
      );
    }
    if (auth.onboardingStep < 4) {
      auth.onboardingStep = 4;
      await this._authRepository.save(auth);
    }
  }
}
