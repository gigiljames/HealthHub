import { MESSAGES } from "../../../../domain/constants/messages";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { IDoctorProfileRepository } from "../../../../domain/interfaces/repositories/IDoctorProfileRepository";
import { IDGetPracticeDetails } from "../../../../domain/interfaces/usecases/doctor/doctorOnboarding/IDGetPracticeDetails";
import { doctorGetPracticeDetailsDTO } from "../../../DTOs/doctor/doctorProfileDTO";

export class DGetPracticeDetails implements IDGetPracticeDetails {
  constructor(
    private readonly _doctorProfileRepository: IDoctorProfileRepository,
  ) {}
  async execute(doctorId: string): Promise<doctorGetPracticeDetailsDTO> {
    const doctorProfile =
      await this._doctorProfileRepository.findByDoctorId(doctorId);
    if (!doctorProfile) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.PROFILE_NOT_FOUND,
      );
    }
    return {
      practiceType: doctorProfile.practiceType ?? null,
      practiceLocations: doctorProfile.practiceLocations ?? [],
    };
  }
}
