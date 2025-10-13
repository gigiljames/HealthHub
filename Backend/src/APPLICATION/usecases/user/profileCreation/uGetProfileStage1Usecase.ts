import { IUserProfileRepository } from "../../../../DOMAIN/interfaces/repositories/IUserProfileRepository";
import { IUGetProfileStage1Usecase } from "../../../../DOMAIN/interfaces/usecases/user/IUGetProfileStage1Usecase";
import { UGetProfileStage1DTO } from "../../../DTOs/user/userProfileCreationDTO";
import { UserProfileMapper } from "../../../mappers/userProfileMapper";

export class UGetProfileStage1Usecase implements IUGetProfileStage1Usecase {
  constructor(private _userProfileRepository: IUserProfileRepository) {}

  async execute(userId: string): Promise<UGetProfileStage1DTO> {
    const profile = await this._userProfileRepository.findByUserId(userId);
    if (!profile) {
      return null;
    } else {
      return UserProfileMapper.toGetProfileStage1DTOFromEntity(profile);
    }
  }
}
