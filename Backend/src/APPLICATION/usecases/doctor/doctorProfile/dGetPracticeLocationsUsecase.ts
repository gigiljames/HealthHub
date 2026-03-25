import { MESSAGES } from "../../../../domain/constants/messages";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { IDoctorProfileRepository } from "../../../../domain/interfaces/repositories/IDoctorProfileRepository";
import { IDGetPracticeLocationsUsecase } from "../../../../domain/interfaces/usecases/doctor/doctorProfile/IDGetPracticeLocationsUsecase";
import { PracticeLocation } from "../../../../domain/types/practiceLocation";

export class DGetPracticeLocationsUsecase implements IDGetPracticeLocationsUsecase {
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

    let practiceLocations = doctorProfile.practiceLocations ?? [];
    practiceLocations = practiceLocations.filter(
      (pLoc) => pLoc.isActive === true,
    );

    return practiceLocations;
  }
}
