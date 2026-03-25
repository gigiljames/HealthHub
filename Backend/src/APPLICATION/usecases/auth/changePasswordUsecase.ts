import { ChangePasswordRequestDTO } from "../../DTOs/auth/authDTO";
import { IAuthRepository } from "../../../domain/interfaces/repositories/IAuthRepository";
import { IChangePasswordUsecase } from "../../../domain/interfaces/usecases/auth/IChangePasswordUsecase";
import { IHashService } from "../../../domain/interfaces/services/IHashService";
import { IEmailService } from "../../../domain/interfaces/services/IEmailService";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";

export class ChangePasswordUsecase implements IChangePasswordUsecase {
  constructor(
    private _authRepository: IAuthRepository,
    private _hashService: IHashService,
    private _emailService: IEmailService,
  ) {}

  async execute(userId: string, data: ChangePasswordRequestDTO): Promise<void> {
    const { currentPassword, newPassword } = data;

    if (!currentPassword || !newPassword) {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        MESSAGES.INVALID_REQUEST_BODY,
      );
    }

    const user = await this._authRepository.findById(userId);

    if (!user) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.USER_DOESNT_EXIST,
      );
    }

    if (user.isBlocked) {
      throw new CustomError(
        HttpStatusCodes.FORBIDDEN,
        MESSAGES.USER_IS_BLOCKED,
      );
    }

    if (user.googleId) {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        MESSAGES.GOOGLE_AUTH_CANNOT_CHANGE_PASSWORD,
      );
    }

    if (!user.passwordHash) {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        MESSAGES.EXTERNAL_AUTH_CANNOT_CHANGE_PASSWORD,
      );
    }

    const verified = await this._hashService.compare(
      currentPassword,
      user.passwordHash,
    );

    if (!verified) {
      throw new CustomError(
        HttpStatusCodes.UNAUTHORIZED,
        MESSAGES.INCORRECT_PASSWORD,
      );
    }

    user.passwordHash = await this._hashService.hash(newPassword);
    await this._authRepository.save(user);

    await this._emailService.sendPasswordChangedEmail(
      user.email ?? "",
      user.name ?? "User",
    );
  }
}
