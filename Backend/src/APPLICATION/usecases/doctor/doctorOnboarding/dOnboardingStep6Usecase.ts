import { IDoctorProfileRepository } from "../../../../domain/interfaces/repositories/IDoctorProfileRepository";
import { IDOnboardingStep6Usecase } from "../../../../domain/interfaces/usecases/doctor/doctorOnboarding/IDOnboardingStep6Usecase";
import { doctorOnboardingStep6DTO } from "../../../DTOs/doctor/doctorProfileDTO";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../../domain/constants/messages";
import { IAuthRepository } from "../../../../domain/interfaces/repositories/IAuthRepository";
import { VerificationStatus } from "../../../../domain/enums/verificationStatus";
import { v4 as uuidv4 } from "uuid";

export class DOnboardingStep6Usecase implements IDOnboardingStep6Usecase {
  constructor(
    private _doctorProfileRepository: IDoctorProfileRepository,
    private _authRepository: IAuthRepository,
  ) {}

  async execute(
    data: doctorOnboardingStep6DTO & { userId: string },
  ): Promise<void> {
    const profile = await this._doctorProfileRepository.findByDoctorId(
      data.userId,
    );
    if (!profile) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.SAVE_PROFILE_ERROR,
      );
    }
    profile.acceptedTerms = true;
    profile.submissionDate = data.submissionDate;
    const submissionId = uuidv4();
    profile.verificationSubmissions.push({
      _id: submissionId,
      status: VerificationStatus.pending,
      remarks: "",
      submissionDate: new Date(),
      reviewDate: null,
    });
    profile.verificationStatus = VerificationStatus.pending;
    profile.activeSubmissionId = submissionId;
    const user = await this._authRepository.findById(data.userId);
    if (user) {
      user.isNewUser = false;
      if (user.onboardingStep < 6) {
        user.onboardingStep = 6;
      }
      await this._doctorProfileRepository.save(profile);
      await this._authRepository.save(user);
    }
  }
}
