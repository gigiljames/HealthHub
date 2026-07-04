import { IDoctorProfileRepository } from "../../../../domain/interfaces/repositories/IDoctorProfileRepository";
import { IDGetVerificationDocsUsecase } from "../../../../domain/interfaces/usecases/doctor/doctorOnboarding/IDGetVerificationDocsUsecase";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../../domain/constants/messages";
import { doctorVerificationDocsDTO } from "../../../../application/DTOs/doctor/doctorProfileDTO";
import { IS3Service } from "../../../../domain/interfaces/services/IS3Service";

export class DGetVerificationDocsUsecase implements IDGetVerificationDocsUsecase {
  constructor(
    private readonly _doctorProfileRepository: IDoctorProfileRepository,
    private readonly _s3Service: IS3Service,
  ) {}
  async execute(doctorId: string): Promise<doctorVerificationDocsDTO> {
    const doctorProfile =
      await this._doctorProfileRepository.findByDoctorId(doctorId);
    if (!doctorProfile) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.SAVE_PROFILE_ERROR,
      );
    }
    return {
      medicalLicense: await this._s3Service.getAccessSignedUrl(
        doctorProfile.certificates.medicalLicence,
      ),
      latestDegree: await this._s3Service.getAccessSignedUrl(
        doctorProfile.certificates.latestDegree,
      ),
    };
  }
}
