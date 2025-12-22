import { GetHospitalProfileResponseDTO } from "../../../DTOs/admin/hospitalManagementDTO";
import { IAuthRepository } from "../../../../domain/interfaces/repositories/IAuthRepository";
import { IHospitalProfileRepository } from "../../../../domain/interfaces/repositories/IHospitalProfileRepository";
import { IGetHospitalProfileUsecase } from "../../../../domain/interfaces/usecases/admin/hospitalManagement/IGetHospitalProfileUsecase";
import { AuthMapper } from "../../../mappers/authMapper";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../../domain/constants/messages";

export class GetHospitalProfileUsecase implements IGetHospitalProfileUsecase {
  constructor(
    private _authRepository: IAuthRepository,
    private _hospitalProfileRepository: IHospitalProfileRepository
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
    return AuthMapper.toAdminHospitalProfileResponseDTO(
      authUser,
      hospitalProfile
    );
  }
}
