import { doctorProfileExperienceDTO } from "../../DTOs/doctor/doctorProfileDTO";
import { IDProfileExperienceUsecase } from "../../../domain/interfaces/usecases/doctor/IDProfileExperienceUsecase";
import { IDoctorProfileRepository } from "../../../domain/interfaces/repositories/IDoctorRepository";
import DoctorProfile from "../../../domain/entities/doctorProfile";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";

export class DProfileExperienceUsecase implements IDProfileExperienceUsecase {
  constructor(private doctorProfileRepository: IDoctorProfileRepository) {}

  async execute(
    data: doctorProfileExperienceDTO,
    doctorId: string
  ): Promise<boolean | null> {
    const existingProfile = await this.doctorProfileRepository.findByDoctorId(
      doctorId
    );

    if (existingProfile) {
      existingProfile.experience = data.experience;
      await this.doctorProfileRepository.save(existingProfile);
      return true;
    } else {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.SAVE_PROFILE_ERROR
      );
    }
  }
}
