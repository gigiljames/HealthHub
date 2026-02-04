import { MESSAGES } from "../../../../domain/constants/messages";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { IDoctorProfileRepository } from "../../../../domain/interfaces/repositories/IDoctorProfileRepository";
import { IDSaveVerificationDocsUsecase } from "../../../../domain/interfaces/usecases/doctor/doctorOnboarding/IDSaveVerificationDocsUsecase";
import { IAuthRepository } from "../../../../domain/interfaces/repositories/IAuthRepository";
import { doctorVerificationDocsDTO } from "../../../DTOs/doctor/doctorProfileDTO";
import { IS3Service } from "../../../../domain/interfaces/services/IS3Service";

export class DSaveVerificationDocsUsecase implements IDSaveVerificationDocsUsecase {
  constructor(
    private _doctorProfileRepository: IDoctorProfileRepository,
    private _authRepository: IAuthRepository,
    private _s3Service: IS3Service,
  ) {}
  async execute(
    doctorId: string,
    medicalLicenseKey: string | null,
    degreeCertificateKey: string | null,
  ): Promise<doctorVerificationDocsDTO> {
    const doctorProfile =
      await this._doctorProfileRepository.findByDoctorId(doctorId);
    if (!doctorProfile) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.SAVE_PROFILE_ERROR,
      );
    }
    if (medicalLicenseKey) {
      doctorProfile.certificates.medicalLicence = medicalLicenseKey;
    }
    if (degreeCertificateKey) {
      doctorProfile.certificates.latestDegree = degreeCertificateKey;
    }
    await this._doctorProfileRepository.save(doctorProfile);
    const auth = await this._authRepository.findById(doctorId);
    if (!auth) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.USER_DOESNT_EXIST,
      );
    }
    if (auth.isNewUser && auth.onboardingStep < 5) {
      auth.onboardingStep = 5;
      await this._authRepository.save(auth);
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
