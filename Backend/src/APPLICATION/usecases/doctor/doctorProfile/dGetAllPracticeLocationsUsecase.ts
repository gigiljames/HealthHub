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
        MESSAGES.SAVE_PROFILE_ERROR,
      );
    }
    const practiceLocations = doctorProfile.practiceLocations ?? [];
    console.log("Helloooo");
    return practiceLocations;
  }
}
