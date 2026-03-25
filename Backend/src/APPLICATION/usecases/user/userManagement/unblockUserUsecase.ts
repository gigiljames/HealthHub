import { ChangeUserStatusRequestDTO } from "../../../DTOs/user/userManagementDTO";
import { IAuthRepository } from "../../../../domain/interfaces/repositories/IAuthRepository";
import { IUnblockUserUsecase } from "../../../../domain/interfaces/usecases/user/userManagement/IUnblockUserUsecase";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../../domain/constants/messages";

export class UnblockUserUsecase implements IUnblockUserUsecase {
  constructor(private _authRepository: IAuthRepository) {}

  async execute(data: ChangeUserStatusRequestDTO): Promise<void> {
    const existingUser = await this._authRepository.findById(data.id);
    if (!existingUser) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, MESSAGES.USER.NOT_FOUND);
    }

    existingUser.unblock();
    await this._authRepository.save(existingUser);
  }
}
