import UserProfile from "../../../../domain/entities/userProfile";
import { IUserProfileRepository } from "../../../../domain/interfaces/repositories/IUserProfileRepository";
import { IUProfileCreation1Usecase } from "../../../../domain/interfaces/usecases/user/IUProfileCreation1Usecase";
import { UProfileCreation1DTO } from "../../../DTOs/user/userProfileCreationDTO";

export class UProfileCreation1Usecase implements IUProfileCreation1Usecase {
  constructor(private _userProfileRepository: IUserProfileRepository) {}

  async execute(data: UProfileCreation1DTO): Promise<void> {
    const exisitngProfile = await this._userProfileRepository.findByUserId(
      data.userId
    );
    if (exisitngProfile) {
      exisitngProfile.allergies = data.allergies;
      exisitngProfile.maritalStatus = data.maritalStatus;
      exisitngProfile.gender = data.gender;
      exisitngProfile.dob = data.dob;
      exisitngProfile.bloodGroup = data.bloodGroup;
      exisitngProfile.occupation = data.occupation;
      await this._userProfileRepository.save(exisitngProfile);
    } else {
      const profile = new UserProfile({
        userId: data.userId,
        allergies: data.allergies,
        maritalStatus: data.maritalStatus,
        gender: data.gender,
        dob: data.dob,
        bloodGroup: data.bloodGroup,
        occupation: data.occupation,
      });
      await this._userProfileRepository.save(profile);
    }
  }
}
