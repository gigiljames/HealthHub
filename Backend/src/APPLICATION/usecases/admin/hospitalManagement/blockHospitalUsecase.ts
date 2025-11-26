import { MESSAGES } from "../../../../domain/constants/messages";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { IAuthRepository } from "../../../../domain/interfaces/repositories/IAuthRepository";
import { IBlockHospitalUsecase } from "../../../../domain/interfaces/usecases/admin/hospitalManagement/IBlockHospitalUsecase";

export class BlockHospitalUsecase implements IBlockHospitalUsecase {
  constructor(private _authRepository: IAuthRepository) {}

  async execute(id: string): Promise<void> {
    const existingHospital = await this._authRepository.findById(id);
    if (!existingHospital) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.USER_DOESNT_EXIST
      );
    }
    existingHospital.block();
    await this._authRepository.save(existingHospital);
  }
}
