import { CompleteSignupRequestDTO } from "../../DTOs/auth/completeSignupDTO";
import Auth from "../../../DOMAIN/entities/auth";
import { IAuthRepository } from "../../../DOMAIN/interfaces/repositories/IAuthRepository";
import { IHashService } from "../../../DOMAIN/interfaces/services/IHashService";
import { IOtpService } from "../../../DOMAIN/interfaces/services/IOtpService";
import { ICompleteSignupUsecase } from "../../../DOMAIN/interfaces/usecases/auth/ICompleteSignupUsecase";
import { Roles } from "../../../DOMAIN/enums/roles";
import { MESSAGES } from "../../../DOMAIN/constants/messages";
import { CustomError } from "../../../DOMAIN/entities/customError";
import { HttpStatusCodes } from "../../../DOMAIN/enums/httpStatusCodes";

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
