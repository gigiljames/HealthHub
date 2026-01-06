import { doctorProfileEducationDTO } from "../../DTOs/doctor/doctorProfileDTO";
import { IDProfileEducationUsecase } from "../../../domain/interfaces/usecases/doctor/IDProfileEducationUsecase";
import { IDoctorProfileRepository } from "../../../domain/interfaces/repositories/IDoctorRepository";
import DoctorProfile from "../../../domain/entities/doctorProfile";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";
import { CustomError } from "../../../domain/entities/customError";

export class DProfileEducationUsecase implements IDProfileEducationUsecase {
  constructor(private doctorProfileRepository: IDoctorProfileRepository) {}

  async execute(
    data: doctorProfileEducationDTO,
    doctorId: string
  ): Promise<boolean | null> {
    const existingProfile = await this.doctorProfileRepository.findByDoctorId(
      doctorId
    );

    if (existingProfile) {
      existingProfile.education = data.education;
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
