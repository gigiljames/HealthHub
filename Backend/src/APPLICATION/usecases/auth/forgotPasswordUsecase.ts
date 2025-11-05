import { MESSAGES } from "../../../domain/constants/messages";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { IOtpEmailTemplate } from "../../../domain/interfaces/emailTemplates/IOtpEmailTemplate";
import { IAuthRepository } from "../../../domain/interfaces/repositories/IAuthRepository";
import { IEmailService } from "../../../domain/interfaces/services/IEmailService";
import { IOtpService } from "../../../domain/interfaces/services/IOtpService";
import { IForgotPasswordUsecase } from "../../../domain/interfaces/usecases/auth/IForgotPasswordUsecase";

export class ForgotPasswordUsecase implements IForgotPasswordUsecase {
  constructor(
    private _emailService: IEmailService,
    private _otpService: IOtpService,
    private _authRepository: IAuthRepository
  ) {}

  async execute(email: string): Promise<void> {
    const existingUser = await this._authRepository.findByEmail(email);
    if (existingUser && existingUser.googleId) {
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
