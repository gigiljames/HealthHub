import { IDSaveSignatureUseCase } from "../../../../domain/interfaces/usecases/doctor/doctorProfile/IDSaveSignatureUseCase";
import { IDoctorProfileRepository } from "../../../../domain/interfaces/repositories/IDoctorProfileRepository";
import DoctorProfile from "../../../../domain/entities/doctorProfile";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../../domain/constants/messages";

export class DSaveSignatureUseCase implements IDSaveSignatureUseCase {
  constructor(
    private readonly _doctorProfileRepository: IDoctorProfileRepository,
  ) {}

  async execute(doctorId: string, signatureKey: string): Promise<DoctorProfile> {
    if (!doctorId || !signatureKey) {
      throw new CustomError(HttpStatusCodes.BAD_REQUEST, MESSAGES.BAD_REQUEST);
    }

    const doctorProfile = await this._doctorProfileRepository.findByDoctorId(doctorId);
    if (!doctorProfile) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.SAVE_PROFILE_ERROR,
      );
    }

    doctorProfile.signatureKey = signatureKey;
    return await this._doctorProfileRepository.save(doctorProfile);
  }
}
