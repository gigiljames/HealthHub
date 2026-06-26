import { IDSaveMedicalRegistrationUseCase } from "../../../../domain/interfaces/usecases/doctor/doctorProfile/IDSaveMedicalRegistrationUseCase";
import { IDoctorProfileRepository } from "../../../../domain/interfaces/repositories/IDoctorProfileRepository";
import DoctorProfile from "../../../../domain/entities/doctorProfile";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../../domain/constants/messages";

export class DSaveMedicalRegistrationUseCase implements IDSaveMedicalRegistrationUseCase {
  constructor(
    private readonly _doctorProfileRepository: IDoctorProfileRepository,
  ) {}

  async execute(doctorId: string, registrationNumber: string): Promise<DoctorProfile> {
    if (!doctorId) {
      throw new CustomError(HttpStatusCodes.BAD_REQUEST, MESSAGES.BAD_REQUEST);
    }

    const doctorProfile = await this._doctorProfileRepository.findByDoctorId(doctorId);
    if (!doctorProfile) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.SAVE_PROFILE_ERROR,
      );
    }

    doctorProfile.medicalRegistrationNumber = registrationNumber || "";
    return await this._doctorProfileRepository.save(doctorProfile);
  }
}
