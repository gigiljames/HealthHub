import { GetDoctorProfileResponseDTO } from "../../../DTOs/doctor/doctorManagementDTO";
import { IAuthRepository } from "../../../../domain/interfaces/repositories/IAuthRepository";
import { IDoctorProfileRepository } from "../../../../domain/interfaces/repositories/IDoctorProfileRepository";
import { IGetDoctorProfileUsecase } from "../../../../domain/interfaces/usecases/doctor/doctorManagement/IGetDoctorProfileUsecase";
import { AuthMapper } from "../../../mappers/authMapper";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../../domain/constants/messages";
import { IS3Service } from "../../../../domain/interfaces/services/IS3Service";

export class GetDoctorProfileUsecase implements IGetDoctorProfileUsecase {
  constructor(
    private readonly _authRepository: IAuthRepository,
    private readonly _doctorProfileRepository: IDoctorProfileRepository,
    private readonly _s3Service: IS3Service,
  ) {}

  async execute(doctorId: string): Promise<GetDoctorProfileResponseDTO> {
    const authUser = await this._authRepository.findById(doctorId);
    if (!authUser) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.USER_DOESNT_EXIST,
      );
    }
    const doctorProfile =
      await this._doctorProfileRepository.findByDoctorIdSpecializationPopulated(
        doctorId,
      );
    if (doctorProfile) {
      doctorProfile.certificates.medicalLicence =
        await this._s3Service.getAccessSignedUrl(
          doctorProfile.certificates.medicalLicence,
        );
      doctorProfile.certificates.latestDegree =
        await this._s3Service.getAccessSignedUrl(
          doctorProfile.certificates.latestDegree,
        );
      if (doctorProfile.profileImageUrl) {
        doctorProfile.profileImageUrl =
          await this._s3Service.getAccessSignedUrl(
            doctorProfile.profileImageUrl,
          );
      }
      if (doctorProfile.bannerImageUrl) {
        doctorProfile.bannerImageUrl = await this._s3Service.getAccessSignedUrl(
          doctorProfile.bannerImageUrl,
        );
      }
      if (doctorProfile.signatureKey) {
        (doctorProfile as any).signatureUrl = await this._s3Service.getAccessSignedUrl(
          doctorProfile.signatureKey,
          "inline"
        );
      }
    }
    return AuthMapper.toAdminDoctorProfileResponseDTO(authUser, doctorProfile);
  }
}
