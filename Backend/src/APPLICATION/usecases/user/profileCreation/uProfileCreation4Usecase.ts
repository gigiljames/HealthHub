import { MESSAGES } from "../../../../DOMAIN/constants/messages";
import { CustomError } from "../../../../DOMAIN/entities/customError";
import { HttpStatusCodes } from "../../../../DOMAIN/enums/httpStatusCodes";
import { IAuthRepository } from "../../../../DOMAIN/interfaces/repositories/IAuthRepository";
import { IUserProfileRepository } from "../../../../DOMAIN/interfaces/repositories/IUserProfileRepository";
import { IUProfileCreation4Usecase } from "../../../../DOMAIN/interfaces/usecases/user/IUProfileCreation4Usecase";
import { UProfileCreation4DTO } from "../../../DTOs/user/userProfileCreationDTO";

export class UProfileCreation4Usecase implements IUProfileCreation4Usecase {
  constructor(
    private _userProfileRepository: IUserProfileRepository,
    private _authRepository: IAuthRepository
  ) {}

  async execute(data: UProfileCreation4DTO): Promise<void> {
    const profile = await this._userProfileRepository.findByUserId(data.userId);
    if (!profile) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.SAVE_PROFILE_ERROR
      );
    }
    profile.pastSurgeries = data.surgeries;
    const user = await this._authRepository.findById(data.userId);
    user.isNewUser = false;
    await this._userProfileRepository.save(profile);
    await this._authRepository.save(user);
  }
}
