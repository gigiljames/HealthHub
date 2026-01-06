import { IHospitalProfileRepository } from "../../../../domain/interfaces/repositories/IHospitalProfileRepository";
import { IVerifyHospitalUsecase } from "../../../../domain/interfaces/usecases/admin/hospitalManagement/IVerifyHospitalUsecase";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../../domain/constants/messages";
import { VerificationStatus } from "../../../../domain/enums/verificationStatus";

export class VerifyHospitalUsecase implements IVerifyHospitalUsecase {
  constructor(private _hospitalProfileRepository: IHospitalProfileRepository) {}

  async execute(
    id: string,
    isApproved: boolean,
    verificationRemarks: string
  ): Promise<boolean> {
    const hospitalProfile =
      await this._hospitalProfileRepository.findByHospitalId(id);

    if (!hospitalProfile) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.USER_DOESNT_EXIST
      );
    }

    hospitalProfile.verificationStatus = isApproved
      ? VerificationStatus.verified
      : VerificationStatus.rejected;
    hospitalProfile.verificationRemarks = verificationRemarks;

    await this._hospitalProfileRepository.save(hospitalProfile);

    return true;
  }
}
