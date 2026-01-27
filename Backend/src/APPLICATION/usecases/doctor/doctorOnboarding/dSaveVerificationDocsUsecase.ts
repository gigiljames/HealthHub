import { MESSAGES } from "../../../../domain/constants/messages";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { IDoctorProfileRepository } from "../../../../domain/interfaces/repositories/IDoctorProfileRepository";
import { IDSaveVerificationDocsUsecase } from "../../../../domain/interfaces/usecases/doctor/doctorOnboarding/IDSaveVerificationDocsUsecase";

export class DSaveVerificationDocsUsecase implements IDSaveVerificationDocsUsecase {
  constructor(
    private readonly doctorProfileRepository: IDoctorProfileRepository,
  ) {}
  async execute(
    doctorId: string,
    medicalLicenseKey: string,
    degreeCertificateKey: string,
  ): Promise<void> {
    const doctorProfile =
      await this.doctorProfileRepository.findByDoctorId(doctorId);
    if (!doctorProfile) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.SAVE_PROFILE_ERROR,
      );
    }
    doctorProfile.certificates.medicalLicence = medicalLicenseKey;
    doctorProfile.certificates.latestDegree = degreeCertificateKey;
    await this.doctorProfileRepository.save(doctorProfile);
  }
}
