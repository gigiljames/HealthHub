import { ChangeUserStatusRequestDTO } from "../../../DTOs/user/userManagementDTO";
import { IAuthRepository } from "../../../../domain/interfaces/repositories/IAuthRepository";
import { IBlockUserUsecase } from "../../../../domain/interfaces/usecases/user/userManagement/IBlockUserUsecase";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../../domain/constants/messages";

export class BlockUserUsecase implements IBlockUserUsecase {
  constructor(private _authRepository: IAuthRepository) {}

  async execute(data: ChangeUserStatusRequestDTO): Promise<void> {
    const existingUser = await this._authRepository.findById(data.id);
    if (!existingUser) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.USER_DOESNT_EXIST
      );
    }

    existingUser.block();
    await this._authRepository.save(existingUser);
  }
}
