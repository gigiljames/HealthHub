import { MESSAGES } from "../../../../domain/constants/messages";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { IAuthRepository } from "../../../../domain/interfaces/repositories/IAuthRepository";
import { IUnblockDoctorUsecase } from "../../../../domain/interfaces/usecases/admin/doctorManagement/IUnblockDoctorUsecase";

export class UnblockDoctorUsecase implements IUnblockDoctorUsecase {
  constructor(private _authRepository: IAuthRepository) {}

  async execute(id: string): Promise<void> {
    const existingUser = await this._authRepository.findById(id);
    if (!existingUser) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.USER_DOESNT_EXIST
      );
    }

    existingUser.unblock();
    await this._authRepository.save(existingUser);
  }
}
