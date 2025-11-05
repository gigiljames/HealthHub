import { MESSAGES } from "../../../domain/constants/messages";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { ICachingService } from "../../../domain/interfaces/services/ICachingService";
import { IOtpService } from "../../../domain/interfaces/services/IOtpService";
import { IForgotPasswordVerifyOtpUsecase } from "../../../domain/interfaces/usecases/auth/IForgotPasswordVerifyOtpUsecase";
import { v4 as uuidv4 } from "uuid";

export class ForgotPasswordVerifyOtpUsecase
  implements IForgotPasswordVerifyOtpUsecase
{
  constructor(
    private _otpService: IOtpService,
    private _cachingService: ICachingService
  ) {}

  execute(otp: string, email: string): string {
    if (this._otpService.verifyOtp(otp, email)) {
      const token = uuidv4();
      this._cachingService.setData(
        `forgot-password-token-${token}`,
        token,
        1000 * 60 * 5
      );
      return token;
    } else {
      throw new CustomError(HttpStatusCodes.UNAUTHORIZED, MESSAGES.INVALID_OTP);
    }
  }
}
