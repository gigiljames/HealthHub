import { MESSAGES } from "../../../../domain/constants/messages";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { IHospitalProfileRepository } from "../../../../domain/interfaces/repositories/IHospitalProfileRepository";
import { IHProfileCreation2Usecase } from "../../../../domain/interfaces/usecases/hospital/IHProfileCreation2Usecase";
import { HProfileCreation2DTO } from "../../../DTOs/hospital/hospitalProfileCreationDTO";

export class HProfileCreation2Usecase implements IHProfileCreation2Usecase {
  constructor(private _hospitalProfileRepository: IHospitalProfileRepository) {}

  async execute(data: HProfileCreation2DTO): Promise<void> {
    const profile = await this._hospitalProfileRepository.findByHospitalId(
      data.hospitalId
    );
    if (!profile) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.SAVE_PROFILE_ERROR
      );
    }

    profile.contact = {
      address: data.address,
      phone: data.phone,
      email: data.email,
      website: data.website || "",
    };
    profile.location = data.location;
    await this._hospitalProfileRepository.save(profile);
  }
}
