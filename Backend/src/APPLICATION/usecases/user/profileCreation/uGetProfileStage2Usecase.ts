import { IUserProfileRepository } from "../../../../DOMAIN/interfaces/repositories/IUserProfileRepository";
import { IUGetProfileStage2Usecase } from "../../../../DOMAIN/interfaces/usecases/user/IUGetProfileStage2Usecase";
import { UGetProfileStage2DTO } from "../../../DTOs/user/userProfileCreationDTO";
import { UserProfileMapper } from "../../../mappers/userProfileMapper";

export class UGetProfileStage2Usecase implements IUGetProfileStage2Usecase {
  constructor(private _userProfileRespository: IUserProfileRepository) {}

  async execute(userId: string): Promise<UGetProfileStage2DTO> {
    const profile = await this._userProfileRespository.findByUserId(userId);
    if (profile) {
      return UserProfileMapper.toGetProfileStage2DTOFromEntity(profile);
    } else {
      return null;
    }
  }
}
