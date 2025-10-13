import { MESSAGES } from "../../../DOMAIN/constants/messages";
import { CustomError } from "../../../DOMAIN/entities/customError";
import { HttpStatusCodes } from "../../../DOMAIN/enums/httpStatusCodes";
import { ICachingService } from "../../../DOMAIN/interfaces/services/ICachingService";
import { IOtpService } from "../../../DOMAIN/interfaces/services/IOtpService";
import { IForgotPasswordVerifyOtpUsecase } from "../../../DOMAIN/interfaces/usecases/auth/IForgotPasswordVerifyOtpUsecase";
import { v4 as uuidv4 } from "uuid";

export class ForgotPasswordVerifyOtpUsecase
  implements IForgotPasswordVerifyOtpUsecase
{
  constructor(
    private _otpService: IOtpService,
    private _cachingService: ICachingService
  ) {}

  async execute(otp: string, email: string): Promise<string> {
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
