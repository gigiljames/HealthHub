import { IDoctorProfileRepository } from "../../../../domain/interfaces/repositories/IDoctorProfileRepository";
import { IVerifyDoctorUsecase } from "../../../../domain/interfaces/usecases/doctor/doctorManagement/IVerifyDoctorUsecase";
import { VerificationStatus } from "../../../../domain/enums/verificationStatus";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../../domain/constants/messages";

export class VerifyDoctorUsecase implements IVerifyDoctorUsecase {
  constructor(private _doctorProfileRepository: IDoctorProfileRepository) {}

  async execute(
    doctorId: string,
    isApproved: boolean,
    verificationRemarks: string,
  ): Promise<void> {
    const doctorProfile =
      await this._doctorProfileRepository.findByDoctorId(doctorId);

    if (!doctorProfile) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.USER_DOESNT_EXIST,
      );
    }

    if (!doctorProfile.activeSubmissionId) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.NO_ACTIVE_SUBMISSION,
      );
    }

    const activeSubmission = doctorProfile.verificationSubmissions.find(
      (submission) => submission._id === doctorProfile.activeSubmissionId,
    );
    if (!activeSubmission) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.VERIFICATION_SUBMISSION_NOT_FOUND,
      );
    }
    // updating the active submission status
    activeSubmission.status = isApproved
      ? VerificationStatus.verified
      : VerificationStatus.rejected;
    // updating verification remarks
    activeSubmission.remarks = verificationRemarks;
    // updating review date
    activeSubmission.reviewDate = new Date();
    // updating verification status
    doctorProfile.verificationStatus = isApproved
      ? VerificationStatus.verified
      : VerificationStatus.rejected;
    // updating active submission id
    doctorProfile.activeSubmissionId = null;
    // updating profile visibility
    doctorProfile.isVisible = isApproved;

    await this._doctorProfileRepository.save(doctorProfile);
    return;
  }
}
