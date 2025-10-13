import { MESSAGES } from "../../../../DOMAIN/constants/messages";
import { CustomError } from "../../../../DOMAIN/entities/customError";
import { HttpStatusCodes } from "../../../../DOMAIN/enums/httpStatusCodes";
import { IUserProfileRepository } from "../../../../DOMAIN/interfaces/repositories/IUserProfileRepository";
import { IUProfileCreation2Usecase } from "../../../../DOMAIN/interfaces/usecases/user/IUProfileCreation2Usecase";
import { UProfileCreation2DTO } from "../../../DTOs/user/userProfileCreationDTO";

export class UProfileCreation2Usecase implements IUProfileCreation2Usecase {
  constructor(private _userProfileRepository: IUserProfileRepository) {}

  async execute(data: UProfileCreation2DTO): Promise<void> {
    const profile = await this._userProfileRepository.findByUserId(data.userId);
    if (!profile) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.SAVE_PROFILE_ERROR
      );
    }
    profile.bodyMetrics = {
      height: Number(data.height),
      weight: Number(data.weight),
      lastUpdated: new Date(),
    };
    profile.contact = { address: data.address, phone: data.phoneNumber };
    await this._userProfileRepository.save(profile);
  }
}
