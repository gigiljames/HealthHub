import { MESSAGES } from "../../../DOMAIN/constants/messages";
import { CustomError } from "../../../DOMAIN/entities/customError";
import { HttpStatusCodes } from "../../../DOMAIN/enums/httpStatusCodes";
import { IOtpEmailTemplate } from "../../../DOMAIN/interfaces/emailTemplates/IOtpEmailTemplate";
import { IAuthRepository } from "../../../DOMAIN/interfaces/repositories/IAuthRepository";
import { IEmailService } from "../../../DOMAIN/interfaces/services/IEmailService";
import { IOtpService } from "../../../DOMAIN/interfaces/services/IOtpService";
import { IForgotPasswordUsecase } from "../../../DOMAIN/interfaces/usecases/auth/IForgotPasswordUsecase";

export class ForgotPasswordUsecase implements IForgotPasswordUsecase {
  constructor(
    private _emailService: IEmailService,
    private _otpService: IOtpService,
    private _authRepository: IAuthRepository
  ) {}

  async execute(email: string): Promise<void> {
    const existingUser = await this._authRepository.findByEmail(email);
    if (existingUser.googleId) {
      throw new CustomError(
        HttpStatusCodes.CONFLICT,
        MESSAGES.GOOGLE_RESET_PASSWORD
      );
    }
    if (existingUser && !existingUser.isBlocked) {
      const otp = this._otpService.generateOtp(email);
      const emailOptions: IOtpEmailTemplate = {
        email,
        name: "User",
        otp,
        subject: "Change password OTP",
        body: "Please enter the above mentioned OTP for verifying your email and resetting your password.",
      };
      await this._emailService.sendOtp(emailOptions);
    } else {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.USER_DOESNT_EXIST
      );
    }
  }
}
