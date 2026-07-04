import { MESSAGES } from "../../../domain/constants/messages";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { Roles } from "../../../domain/enums/roles";
import { IAuthRepository } from "../../../domain/interfaces/repositories/IAuthRepository";
import { ICachingService } from "../../../domain/interfaces/services/ICachingService";
import { IHashService } from "../../../domain/interfaces/services/IHashService";
import { IResetPasswordUsecase } from "../../../domain/interfaces/usecases/auth/IResetPasswordUsecase";
import { ICreateNotificationUseCase } from "../../../domain/interfaces/usecases/notification/ICreateNotificationUseCase";
import { NotificationType } from "../../../domain/enums/notificationType";

export class ResetPasswordUsecase implements IResetPasswordUsecase {
  constructor(
    private readonly _cachingService: ICachingService,
    private readonly _hashService: IHashService,
    private readonly _authRepository: IAuthRepository,
    private readonly _createNotificationUseCase: ICreateNotificationUseCase,
  ) {}

  async execute(
    password: string,
    email: string,
    token: string,
  ): Promise<Roles> {
    const cachedToken = this._cachingService.getData(
      `forgot-password-token-${token}`,
    );
    if (cachedToken === token) {
      const passwordHash = await this._hashService.hash(password);
      const user = await this._authRepository.findByEmail(email);
      if (!user) {
        throw new CustomError(
          HttpStatusCodes.NOT_FOUND,
          MESSAGES.USER_DOESNT_EXIST,
        );
      }
      user.passwordHash = passwordHash;
      await this._authRepository.save(user);

      await this._createNotificationUseCase.execute({
        userId: user.id as string,
        role: user.role as Roles,
        title: "Password Reset",
        message: "Your password was successfully reset.",
        type: NotificationType.PASSWORD_CHANGED,
      });

      return user.role as Roles;
    } else {
      throw new CustomError(
        HttpStatusCodes.UNAUTHORIZED,
        MESSAGES.EMAIL_VALIDATION_EXPIRED,
      );
    }
  }
}
