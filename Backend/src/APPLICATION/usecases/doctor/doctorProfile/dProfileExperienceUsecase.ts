import { doctorProfileExperienceDTO } from "../../../DTOs/doctor/doctorProfileDTO";
import { IDProfileExperienceUsecase } from "../../../../domain/interfaces/usecases/doctor/doctorProfile/IDProfileExperienceUsecase";
import { IDoctorProfileRepository } from "../../../../domain/interfaces/repositories/IDoctorProfileRepository";
import DoctorProfile from "../../../../domain/entities/doctorProfile";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../../domain/constants/messages";

export class DProfileExperienceUsecase implements IDProfileExperienceUsecase {
  constructor(
    private readonly _doctorProfileRepository: IDoctorProfileRepository,
  ) {}

  async execute(
    data: doctorProfileExperienceDTO,
    doctorId: string,
  ): Promise<boolean | null> {
    const existingProfile =
      await this._doctorProfileRepository.findByDoctorId(doctorId);

    if (existingProfile) {
      existingProfile.experience = data.experience;
      await this._doctorProfileRepository.save(existingProfile);
      return true;
    } else {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.DOCTOR.PROFILE_NOT_FOUND,
      );
    }
  }
}
