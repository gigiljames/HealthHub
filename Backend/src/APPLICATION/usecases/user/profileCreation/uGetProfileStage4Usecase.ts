import { IUserProfileRepository } from "../../../../DOMAIN/interfaces/repositories/IUserProfileRepository";
import { IUGetProfileStage4Usecase } from "../../../../DOMAIN/interfaces/usecases/user/IUGetProfileStage4Usecase";
import { UGetProfileStage4DTO } from "../../../DTOs/user/userProfileCreationDTO";
import { UserProfileMapper } from "../../../mappers/userProfileMapper";

export class UGetProfileStage4Usecase implements IUGetProfileStage4Usecase {
  constructor(private _userProfileRespository: IUserProfileRepository) {}

  async execute(userId: string): Promise<UGetProfileStage4DTO> {
    const profile = await this._userProfileRespository.findByUserId(userId);
    if (profile) {
      return UserProfileMapper.toGetProfileStage4DTOFromEntity(profile);
    } else {
      return null;
    }
  }
}
