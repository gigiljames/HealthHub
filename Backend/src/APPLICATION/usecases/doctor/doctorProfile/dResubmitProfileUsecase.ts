import { MESSAGES } from "../../../../domain/constants/messages";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { IDoctorProfileRepository } from "../../../../domain/interfaces/repositories/IDoctorProfileRepository";
import { IDResubmitProfileUsecase } from "../../../../domain/interfaces/usecases/doctor/doctorProfile/IDResubmitProfileUsecase";
import { VerificationStatus } from "../../../../domain/enums/verificationStatus";
import { v4 as uuidv4 } from "uuid";

export class DResubmitProfileUsecase implements IDResubmitProfileUsecase {
  constructor(
    private readonly _doctorProfileRepository: IDoctorProfileRepository,
  ) {}

  async execute(doctorId: string): Promise<void> {
    const doctorProfile =
      await this._doctorProfileRepository.findByDoctorId(doctorId);
    if (!doctorProfile) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.DOCTOR.PROFILE_NOT_FOUND,
      );
    }
    if (doctorProfile.verificationStatus === "resubmitted") {
      return;
    }
    const submissionId = uuidv4();
    doctorProfile.verificationSubmissions.push({
      _id: submissionId,
      status: VerificationStatus.pending,
      remarks: "",
      submissionDate: new Date(),
      reviewDate: null,
    });
    doctorProfile.verificationStatus = VerificationStatus.resubmitted;
    doctorProfile.activeSubmissionId = submissionId;
    await this._doctorProfileRepository.save(doctorProfile);
    return;
  }
}
