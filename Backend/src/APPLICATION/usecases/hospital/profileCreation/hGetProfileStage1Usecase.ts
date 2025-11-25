import { MESSAGES } from "../../../../domain/constants/messages";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { IAuthRepository } from "../../../../domain/interfaces/repositories/IAuthRepository";
import { IHospitalProfileRepository } from "../../../../domain/interfaces/repositories/IHospitalProfileRepository";
import { IHGetProfileStage1Usecase } from "../../../../domain/interfaces/usecases/hospital/IHGetProfileStage1Usecase";
import { HGetProfileStage1DTO } from "../../../DTOs/hospital/hospitalProfileCreationDTO";
import { HospitalProfileMapper } from "../../../mappers/hospitalProfileMapper";

export class HGetProfileStage1Usecase implements IHGetProfileStage1Usecase {
  constructor(
    private _hospitalProfileRepository: IHospitalProfileRepository,
    private _authRepository: IAuthRepository
  ) {}

  async execute(hospitalId: string): Promise<HGetProfileStage1DTO | null> {
    const profile = await this._hospitalProfileRepository.findByHospitalId(
      hospitalId
    );
    if (!profile) return null;
    const authUser = await this._authRepository.findById(hospitalId);
    if (!authUser) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.USER_DOESNT_EXIST
      );
    }
    return HospitalProfileMapper.toGetProfileStage1DTOFromEntity(
      profile,
      authUser.name
    );
  }
}
