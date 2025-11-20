import { GetUserProfileResponseDTO } from "../../../DTOs/admin/userManagementDTO";
import { IAuthRepository } from "../../../../domain/interfaces/repositories/IAuthRepository";
import { IUserProfileRepository } from "../../../../domain/interfaces/repositories/IUserProfileRepository";
import { IGetUserProfileUsecase } from "../../../../domain/interfaces/usecases/admin/userManagement/IGetUserProfileUsecase";
import { AuthMapper } from "../../../mappers/authMapper";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../../domain/constants/messages";

export class GetUserProfileUsecase implements IGetUserProfileUsecase {
  constructor(
    private _authRepository: IAuthRepository,
    private _userProfileRepository: IUserProfileRepository
  ) {}

  async execute(userId: string): Promise<GetUserProfileResponseDTO> {
    const authUser = await this._authRepository.findById(userId);
    if (!authUser) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.USER_DOESNT_EXIST
      );
    }
    const userProfile = await this._userProfileRepository.findByUserId(userId);
    return AuthMapper.toAdminUserProfileResponseDTO(authUser, userProfile);
  }
}
