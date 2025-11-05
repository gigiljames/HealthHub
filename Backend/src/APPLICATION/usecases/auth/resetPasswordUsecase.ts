import { MESSAGES } from "../../../domain/constants/messages";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { Roles } from "../../../domain/enums/roles";
import { IAuthRepository } from "../../../domain/interfaces/repositories/IAuthRepository";
import { ICachingService } from "../../../domain/interfaces/services/ICachingService";
import { IHashService } from "../../../domain/interfaces/services/IHashService";
import { IResetPasswordUsecase } from "../../../domain/interfaces/usecases/auth/IResetPasswordUsecase";

export class ResetPasswordUsecase implements IResetPasswordUsecase {
  constructor(
    private _cachingService: ICachingService,
    private _hashService: IHashService,
    private _authRepository: IAuthRepository
  ) {}

  async execute(
    password: string,
    email: string,
    token: string
  ): Promise<Roles> {
    const cachedToken = this._cachingService.getData(
      `forgot-password-token-${token}`
    );
    if (cachedToken === token) {
      const passwordHash = await this._hashService.hash(password);
      const user = await this._authRepository.findByEmail(email);
      if (!user) {
        throw new CustomError(
          HttpStatusCodes.NOT_FOUND,
          MESSAGES.USER_DOESNT_EXIST
        );
      }
      user.passwordHash = passwordHash;
      await this._authRepository.save(user);
      return user.role;
    } else {
      throw new CustomError(
        HttpStatusCodes.UNAUTHORIZED,
        MESSAGES.EMAIL_VALIDATION_EXPIRED
      );
    }
  }
}
