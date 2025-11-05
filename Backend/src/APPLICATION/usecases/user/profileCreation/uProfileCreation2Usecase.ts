import { MESSAGES } from "../../../../domain/constants/messages";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { IUserProfileRepository } from "../../../../domain/interfaces/repositories/IUserProfileRepository";
import { IUProfileCreation2Usecase } from "../../../../domain/interfaces/usecases/user/IUProfileCreation2Usecase";
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
