import { IAuthRepository } from "../../../../domain/interfaces/repositories/IAuthRepository";
import { IUserProfileRepository } from "../../../../domain/interfaces/repositories/IUserProfileRepository";
import { IUGetFullProfileUsecase } from "../../../../domain/interfaces/usecases/user/userProfile/IUGetFullProfileUsecase";
import { UGetFullProfileDTO } from "../../../DTOs/user/userProfileDTO";
import { UserProfileMapper } from "../../../mappers/userProfileMapper";

export class UGetFullProfileUsecase implements IUGetFullProfileUsecase {
  constructor(
    private readonly _userProfileRepository: IUserProfileRepository,
    private readonly _authRepository: IAuthRepository,
  ) {}

  async execute(userId: string): Promise<UGetFullProfileDTO | null> {
    const profile = await this._userProfileRepository.findByUserId(userId);
    const authUser = await this._authRepository.findById(userId);
    if (profile && authUser && authUser.name) {
      return UserProfileMapper.toGetFullProfileDTOFromEntity(
        profile,
        authUser.name,
      );
    }
    return null;
  }
}
