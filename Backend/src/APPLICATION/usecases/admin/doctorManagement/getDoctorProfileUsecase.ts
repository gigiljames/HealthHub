import { GetDoctorProfileResponseDTO } from "../../../DTOs/admin/doctorManagementDTO";
import { IAuthRepository } from "../../../../domain/interfaces/repositories/IAuthRepository";
import { IDoctorProfileRepository } from "../../../../domain/interfaces/repositories/IDoctorRepository";
import { IGetDoctorProfileUsecase } from "../../../../domain/interfaces/usecases/admin/doctorManagement/IGetDoctorProfileUsecase";
import { AuthMapper } from "../../../mappers/authMapper";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../../domain/constants/messages";

export class GetDoctorProfileUsecase implements IGetDoctorProfileUsecase {
  constructor(
    private _authRepository: IAuthRepository,
    private _doctorProfileRepository: IDoctorProfileRepository
  ) {}

  async execute(doctorId: string): Promise<GetDoctorProfileResponseDTO> {
    const authUser = await this._authRepository.findById(doctorId);
    if (!authUser) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.USER_DOESNT_EXIST
      );
    }
    const doctorProfile =
      await this._doctorProfileRepository.findByDoctorIdPopulated(doctorId);
    return AuthMapper.toAdminDoctorProfileResponseDTO(authUser, doctorProfile);
  }
}
