import { doctorProfileEducationDTO } from "../../../DTOs/doctor/doctorProfileDTO";
import { IDProfileEducationUsecase } from "../../../../domain/interfaces/usecases/doctor/doctorProfile/IDProfileEducationUsecase";
import { IDoctorProfileRepository } from "../../../../domain/interfaces/repositories/IDoctorProfileRepository";
import DoctorProfile from "../../../../domain/entities/doctorProfile";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../../domain/constants/messages";
import { CustomError } from "../../../../domain/entities/customError";

export class DProfileEducationUsecase implements IDProfileEducationUsecase {
  constructor(
    private readonly _doctorProfileRepository: IDoctorProfileRepository,
  ) {}

  async execute(
    data: doctorProfileEducationDTO,
    doctorId: string,
  ): Promise<boolean | null> {
    const existingProfile =
      await this._doctorProfileRepository.findByDoctorId(doctorId);

    if (existingProfile) {
      existingProfile.education = data.education;
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
