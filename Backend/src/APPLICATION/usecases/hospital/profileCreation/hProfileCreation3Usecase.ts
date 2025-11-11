import { MESSAGES } from "../../../../domain/constants/messages";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { IHospitalProfileRepository } from "../../../../domain/interfaces/repositories/IHospitalProfileRepository";
import { IHProfileCreation3Usecase } from "../../../../domain/interfaces/usecases/hospital/IHProfileCreation3Usecase";
import { HProfileCreation3DTO } from "../../../DTOs/hospital/hospitalProfileCreationDTO";

export class HProfileCreation3Usecase implements IHProfileCreation3Usecase {
  constructor(private _hospitalProfileRepository: IHospitalProfileRepository) {}

  async execute(data: HProfileCreation3DTO): Promise<void> {
    const profile = await this._hospitalProfileRepository.findByHospitalId(
      data.hospitalId
    );
    if (!profile) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.SAVE_PROFILE_ERROR
      );
    }
    profile.certificates = {
      hospitalRegistration:
        data.hospitalRegistration ||
        profile.certificates?.hospitalRegistration ||
        "",
      gstCertificate:
        data.gstCertificate || profile.certificates?.gstCertificate || "",
    };
    await this._hospitalProfileRepository.save(profile);
  }
}
