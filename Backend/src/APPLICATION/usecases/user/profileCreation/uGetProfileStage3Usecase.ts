import { IUserProfileRepository } from "../../../../domain/interfaces/repositories/IUserProfileRepository";
import { IUGetProfileStage3Usecase } from "../../../../domain/interfaces/usecases/user/IUGetProfileStage3Usecase";
import { UGetProfileStage3DTO } from "../../../DTOs/user/userProfileCreationDTO";
import { UserProfileMapper } from "../../../mappers/userProfileMapper";

export class UGetProfileStage3Usecase implements IUGetProfileStage3Usecase {
  constructor(private _userProfileRepository: IUserProfileRepository) {}

  async execute(userId: string): Promise<UGetProfileStage3DTO | null> {
    const profile = await this._userProfileRepository.findByUserId(userId);
    if (profile) {
      return UserProfileMapper.toGetProfileStage3DTOFromEntity(profile);
    } else {
      return null;
    }
  }
}
