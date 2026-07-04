import { ChangePasswordRequestDTO } from "../../DTOs/auth/authDTO";
import { IAuthRepository } from "../../../domain/interfaces/repositories/IAuthRepository";
import { IChangePasswordUsecase } from "../../../domain/interfaces/usecases/auth/IChangePasswordUsecase";
import { IHashService } from "../../../domain/interfaces/services/IHashService";
import { IEmailService } from "../../../domain/interfaces/services/IEmailService";
import { ICreateNotificationUseCase } from "../../../domain/interfaces/usecases/notification/ICreateNotificationUseCase";
import { NotificationType } from "../../../domain/enums/notificationType";
import { Roles } from "../../../domain/enums/roles";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";

export class ChangePasswordUsecase implements IChangePasswordUsecase {
  constructor(
    private readonly _authRepository: IAuthRepository,
    private readonly _hashService: IHashService,
    private readonly _emailService: IEmailService,
    private readonly _createNotificationUseCase: ICreateNotificationUseCase,
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

    await this._createNotificationUseCase.execute({
      userId: user.id as string,
      role: user.role as Roles,
      title: "Password Changed",
      message: "Your password was successfully changed.",
      type: NotificationType.PASSWORD_CHANGED,
    });
  }
}
