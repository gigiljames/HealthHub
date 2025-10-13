import { MESSAGES } from "../../../DOMAIN/constants/messages";
import { CustomError } from "../../../DOMAIN/entities/customError";
import { HttpStatusCodes } from "../../../DOMAIN/enums/httpStatusCodes";
import { Roles } from "../../../DOMAIN/enums/roles";
import { IAuthRepository } from "../../../DOMAIN/interfaces/repositories/IAuthRepository";
import { ICachingService } from "../../../DOMAIN/interfaces/services/ICachingService";
import { IHashService } from "../../../DOMAIN/interfaces/services/IHashService";
import { IResetPasswordUsecase } from "../../../DOMAIN/interfaces/usecases/auth/IResetPasswordUsecase";

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
