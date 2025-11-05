import { CompleteSignupRequestDTO } from "../../DTOs/auth/completeSignupDTO";
import Auth from "../../../domain/entities/auth";
import { IAuthRepository } from "../../../domain/interfaces/repositories/IAuthRepository";
import { IHashService } from "../../../domain/interfaces/services/IHashService";
import { IOtpService } from "../../../domain/interfaces/services/IOtpService";
import { ICompleteSignupUsecase } from "../../../domain/interfaces/usecases/auth/ICompleteSignupUsecase";
import { Roles } from "../../../domain/enums/roles";
import { MESSAGES } from "../../../domain/constants/messages";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";

export class CompleteSignupUsecase implements ICompleteSignupUsecase {
  constructor(
    private _authRepository: IAuthRepository,
    private _otpService: IOtpService,
    private _hashService: IHashService
  ) {}
  async execute(data: CompleteSignupRequestDTO): Promise<void> {
    if (data.role === Roles.ADMIN) {
      throw new CustomError(HttpStatusCodes.FORBIDDEN, MESSAGES.INVALID_ROLE);
    }
    if (this._otpService.verifyOtp(data.otp, data.email)) {
      const passwordHash = await this._hashService.hash(data.password);
      const authUser = new Auth({
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role,
        isBlocked: false,
        isNewUser: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await this._authRepository.save(authUser);
    } else {
      throw new CustomError(HttpStatusCodes.UNAUTHORIZED, MESSAGES.INVALID_OTP);
    }
  }
}
