import { MESSAGES } from "../../../../domain/constants/messages";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { IHospitalProfileRepository } from "../../../../domain/interfaces/repositories/IHospitalProfileRepository";
import { IHProfileCreation5Usecase } from "../../../../domain/interfaces/usecases/hospital/IHProfileCreation5Usecase";
import { HProfileCreation5DTO } from "../../../DTOs/hospital/hospitalProfileCreationDTO";

export class HProfileCreation5Usecase implements IHProfileCreation5Usecase {
  constructor(private _hospitalProfileRepository: IHospitalProfileRepository) {}

  async execute(data: HProfileCreation5DTO): Promise<void> {
    const profile = await this._hospitalProfileRepository.findByHospitalId(
      data.hospitalId
    );
    if (!profile) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.SAVE_PROFILE_ERROR
      );
    }
    profile.acceptedTerms = data.acceptedTerms;
    profile.submissionDate = data.submissionDate;
    await this._hospitalProfileRepository.save(profile);
  }
}
