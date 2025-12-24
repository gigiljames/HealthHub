import { GetHospitalProfileResponseDTO } from "../../../DTOs/admin/hospitalManagementDTO";
import { IAuthRepository } from "../../../../domain/interfaces/repositories/IAuthRepository";
import { IHospitalProfileRepository } from "../../../../domain/interfaces/repositories/IHospitalProfileRepository";
import { IGetHospitalProfileUsecase } from "../../../../domain/interfaces/usecases/admin/hospitalManagement/IGetHospitalProfileUsecase";
import { AuthMapper } from "../../../mappers/authMapper";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../../domain/constants/messages";
import { IS3Service } from "../../../../domain/interfaces/services/IS3Service";

export class GetHospitalProfileUsecase implements IGetHospitalProfileUsecase {
  constructor(
    private _authRepository: IAuthRepository,
    private _hospitalProfileRepository: IHospitalProfileRepository,
    private s3Service: IS3Service
  ) {}

  async execute(hospitalId: string): Promise<GetHospitalProfileResponseDTO> {
    const authUser = await this._authRepository.findById(hospitalId);
    if (!authUser) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.USER_DOESNT_EXIST
      );
    }
    const hospitalProfile =
      await this._hospitalProfileRepository.findByHospitalId(hospitalId);
    if (hospitalProfile) {
      let hosRegCert = hospitalProfile.certificates?.hospitalRegistration;
      let gstCert = hospitalProfile.certificates?.gstCertificate;
      let hosRegCertUrl: string = "";
      let gstCertUrl: string = "";
      if (hosRegCert) {
        hosRegCertUrl = await this.s3Service.getAccessSignedUrl(hosRegCert);
      }
      if (gstCert) {
        gstCertUrl = await this.s3Service.getAccessSignedUrl(gstCert);
      }
      hospitalProfile.certificates = {
        hospitalRegistration: hosRegCertUrl,
        gstCertificate: gstCertUrl,
      };
    }
    return AuthMapper.toAdminHospitalProfileResponseDTO(
      authUser,
      hospitalProfile
    );
  }
}
