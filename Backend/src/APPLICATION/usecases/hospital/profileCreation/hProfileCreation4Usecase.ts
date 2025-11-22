import { MESSAGES } from "../../../../domain/constants/messages";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { IHospitalProfileRepository } from "../../../../domain/interfaces/repositories/IHospitalProfileRepository";
import { IHProfileCreation4Usecase } from "../../../../domain/interfaces/usecases/hospital/IHProfileCreation4Usecase";
import { HProfileCreation4DTO } from "../../../DTOs/hospital/hospitalProfileCreationDTO";

export class HProfileCreation4Usecase implements IHProfileCreation4Usecase {
  constructor(private _hospitalProfileRepository: IHospitalProfileRepository) {}

  async execute(data: HProfileCreation4DTO): Promise<void> {
    const profile = await this._hospitalProfileRepository.findByHospitalId(
      data.hospitalId
    );
    if (!profile) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.SAVE_PROFILE_ERROR
      );
    }

    profile.features = data.features;
    await this._hospitalProfileRepository.save(profile);
  }
}
