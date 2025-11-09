import { IHospitalProfileRepository } from "../../../../domain/interfaces/repositories/IHospitalProfileRepository";
import { IHProfileCreation1Usecase } from "../../../../domain/interfaces/usecases/hospital/IHProfileCreation1Usecase";
import { HProfileCreation1DTO } from "../../../DTOs/hospital/hospitalProfileCreationDTO";
import { HospitalProfile } from "../../../../domain/entities/hospitalProfile";

export class HProfileCreation1Usecase implements IHProfileCreation1Usecase {
  constructor(private _hospitalProfileRepository: IHospitalProfileRepository) {}

  async execute(data: HProfileCreation1DTO): Promise<void> {
    const existingProfile =
      await this._hospitalProfileRepository.findByHospitalId(data.hospitalId);
    if (existingProfile) {
      existingProfile.type = data.type;
      existingProfile.profileImageUrl = data.profileImage
        ? data.profileImage.path // S3 upload can happen later
        : existingProfile.profileImageUrl;
      await this._hospitalProfileRepository.save(existingProfile);
    } else {
      const newProfile = new HospitalProfile({
        hospitalId: data.hospitalId,
        type: data.type,
        profileImageUrl: data.profileImage?.path || "",
      });
      await this._hospitalProfileRepository.save(newProfile);
    }
  }
}
