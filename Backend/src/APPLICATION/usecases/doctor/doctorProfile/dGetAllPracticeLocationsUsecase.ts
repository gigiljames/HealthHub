import { IDGetAllPracticeLocationsUsecase } from "../../../../domain/interfaces/usecases/doctor/doctorProfile/IDGetAllPracticeLocationsUsecase";
import { PracticeLocation } from "../../../../domain/types/practiceLocation";
import { IDoctorProfileRepository } from "../../../../domain/interfaces/repositories/IDoctorProfileRepository";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { CustomError } from "../../../../domain/entities/customError";
import { MESSAGES } from "../../../../domain/constants/messages";

export class DGetAllPracticeLocationsUsecase implements IDGetAllPracticeLocationsUsecase {
  constructor(private _doctorProfileRepository: IDoctorProfileRepository) {}
  async execute(userId: string): Promise<PracticeLocation[]> {
    const doctorProfile =
      await this._doctorProfileRepository.findByDoctorId(userId);
    if (!doctorProfile) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.DOCTOR.PROFILE_NOT_FOUND,
      );
    }
    const practiceLocations = doctorProfile.practiceLocations ?? [];
    return practiceLocations;
  }
}
