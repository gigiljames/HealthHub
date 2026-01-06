import { IDoctorProfileRepository } from "../../../../domain/interfaces/repositories/IDoctorRepository";
import { IVerifyDoctorUsecase } from "../../../../domain/interfaces/usecases/admin/doctorManagement/IVerifyDoctorUsecase";
import { VerificationStatus } from "../../../../domain/enums/verificationStatus";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../../domain/constants/messages";

export class VerifyDoctorUsecase implements IVerifyDoctorUsecase {
  constructor(private _doctorProfileRepository: IDoctorProfileRepository) {}

  async execute(
    doctorId: string,
    isApproved: boolean,
    verificationRemarks: string
  ): Promise<void> {
    const doctorProfile = await this._doctorProfileRepository.findByDoctorId(
      doctorId
    );

    if (!doctorProfile) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.USER_DOESNT_EXIST
      );
    }

    doctorProfile.verificationStatus = isApproved
      ? VerificationStatus.verified
      : VerificationStatus.rejected;
    doctorProfile.verificationRemarks = verificationRemarks;

    await this._doctorProfileRepository.save(doctorProfile);
  }
}
