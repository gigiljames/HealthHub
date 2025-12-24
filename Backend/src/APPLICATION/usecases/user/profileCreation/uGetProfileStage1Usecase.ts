import { IAuthRepository } from "../../../../domain/interfaces/repositories/IAuthRepository";
import { IUserProfileRepository } from "../../../../domain/interfaces/repositories/IUserProfileRepository";
import { IUGetProfileStage1Usecase } from "../../../../domain/interfaces/usecases/user/IUGetProfileStage1Usecase";
import { UGetProfileStage1DTO } from "../../../DTOs/user/userProfileCreationDTO";
import { UserProfileMapper } from "../../../mappers/userProfileMapper";

export class UGetProfileStage1Usecase implements IUGetProfileStage1Usecase {
  constructor(
    private _userProfileRepository: IUserProfileRepository,
    private _authRepository: IAuthRepository
  ) {}

  async execute(userId: string): Promise<UGetProfileStage1DTO | null> {
    const profile = await this._userProfileRepository.findByUserId(userId);
    const authUser = await this._authRepository.findById(userId);
    if (profile && authUser && authUser.name) {
      return UserProfileMapper.toGetProfileStage1DTOFromEntity(
        profile,
        authUser.name
      );
    }
    return null;
  }
}
