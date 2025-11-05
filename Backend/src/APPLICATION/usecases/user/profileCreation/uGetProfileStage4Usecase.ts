import { IUserProfileRepository } from "../../../../domain/interfaces/repositories/IUserProfileRepository";
import { IUGetProfileStage4Usecase } from "../../../../domain/interfaces/usecases/user/IUGetProfileStage4Usecase";
import { UGetProfileStage4DTO } from "../../../DTOs/user/userProfileCreationDTO";
import { UserProfileMapper } from "../../../mappers/userProfileMapper";

export class UGetProfileStage4Usecase implements IUGetProfileStage4Usecase {
  constructor(private _userProfileRespository: IUserProfileRepository) {}

  async execute(userId: string): Promise<UGetProfileStage4DTO | null> {
    const profile = await this._userProfileRespository.findByUserId(userId);
    if (profile) {
      return UserProfileMapper.toGetProfileStage4DTOFromEntity(profile);
    } else {
      return null;
    }
  }
}
