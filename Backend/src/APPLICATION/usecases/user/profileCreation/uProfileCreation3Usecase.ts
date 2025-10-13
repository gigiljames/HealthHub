import { MESSAGES } from "../../../../DOMAIN/constants/messages";
import { CustomError } from "../../../../DOMAIN/entities/customError";
import { HttpStatusCodes } from "../../../../DOMAIN/enums/httpStatusCodes";
import { IUserProfileRepository } from "../../../../DOMAIN/interfaces/repositories/IUserProfileRepository";
import { IUProfileCreation3Usecase } from "../../../../DOMAIN/interfaces/usecases/user/IUProfileCreation3Usecase";
import { UProfileCreation3DTO } from "../../../DTOs/user/userProfileCreationDTO";

export class UProfileCreation3Usecase implements IUProfileCreation3Usecase {
  constructor(private _userProfileRepository: IUserProfileRepository) {}

  async execute(data: UProfileCreation3DTO): Promise<void> {
    const profile = await this._userProfileRepository.findByUserId(data.userId);
    if (!profile) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.SAVE_PROFILE_ERROR
      );
    }
    profile.pastDiseases = {
      tuberculosis: {
        value: data.tb,
        lastUpdated: new Date(),
      },
      bronchialAsthma: {
        value: data.bronchialAsthma,
        lastUpdated: new Date(),
      },
      epilepsy: {
        value: data.epilepsy,
        lastUpdated: new Date(),
      },
    };
    await this._userProfileRepository.save(profile);
  }
}
