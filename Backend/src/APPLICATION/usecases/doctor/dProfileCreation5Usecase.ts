import DoctorProfile from "../../../domain/entities/doctorProfile";
import { IDoctorProfileRepository } from "../../../domain/interfaces/repositories/IDoctorRepository";
import { IDProfileCreation5Usecase } from "../../../domain/interfaces/usecases/doctor/IDProfileCreation5Usecase";
import { doctorProfileStage5DTO } from "../../DTOs/doctor/doctorProfileDTO";
import { Gender } from "../../../domain/enums/gender";
import { VerificationStatus } from "../../../domain/enums/verificationStatus";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";
import { IAuthRepository } from "../../../domain/interfaces/repositories/IAuthRepository";

export class DProfileCreation5Usecase implements IDProfileCreation5Usecase {
  constructor(
    private _doctorProfileRepository: IDoctorProfileRepository,
    private _authRepository: IAuthRepository
  ) {}

  async execute(
    data: doctorProfileStage5DTO & { userId: string }
  ): Promise<void> {
    const profile = await this._doctorProfileRepository.findByDoctorId(
      data.userId
    );
    if (!profile) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.SAVE_PROFILE_ERROR
      );
    }
    profile.acceptedTerms = true;
    profile.submissionDate = data.submissionDate;
    const user = await this._authRepository.findById(data.userId);
    if (user) {
      user.isNewUser = false;
      await this._doctorProfileRepository.save(profile);
      await this._authRepository.save(user);
    }
  }
}
