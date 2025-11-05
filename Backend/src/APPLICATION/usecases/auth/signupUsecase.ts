import { AuthRequestDTO } from "../../DTOs/auth/authDTO";
import { IOtpEmailTemplate } from "../../../domain/interfaces/emailTemplates/IOtpEmailTemplate";
import { IAuthRepository } from "../../../domain/interfaces/repositories/IAuthRepository";
import { IEmailService } from "../../../domain/interfaces/services/IEmailService";
import { IOtpService } from "../../../domain/interfaces/services/IOtpService";
import { ISignupUsecase } from "../../../domain/interfaces/usecases/auth/ISignupUsecase";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";
import { Roles } from "../../../domain/enums/roles";
import { logger } from "../../../utils/logger";

export class SignupUsecase implements ISignupUsecase {
  constructor(
    private _otpService: IOtpService,
    private _emailService: IEmailService,
    private _authRepository: IAuthRepository
  ) {}
  async execute(data: AuthRequestDTO): Promise<void> {
    // role field exists in data object, use if needed
    const email = data.email;
    const name = data.name ?? "User";

    const existingUser = await this._authRepository.findByEmail(email);
    if (existingUser) {
      throw new CustomError(
        HttpStatusCodes.CONFLICT,
        MESSAGES.USER_ALREADY_EXISTS
      );
    }
    const otp = this._otpService.generateOtp(email);
    const emailOptions: IOtpEmailTemplate = {
      email,
      name,
      otp,
      subject: "HealthHub signup OTP",
      body: "Please enter the above mentioned OTP for verifying your email and completing signup to HealthHub.",
    };
    await this._emailService.sendOtp(emailOptions);
  }
}
