import { AuthRequestDTO } from "../../DTOs/auth/authDTO";
import { IOtpEmailTemplate } from "../../../domain/interfaces/emailTemplates/IOtpEmailTemplate";
import { IAuthRepository } from "../../../domain/interfaces/repositories/IAuthRepository";
import { IEmailService } from "../../../domain/interfaces/services/IEmailService";
import { IOtpService } from "../../../domain/interfaces/services/IOtpService";
import { IResendOtpUsecase } from "../../../domain/interfaces/usecases/auth/IResendOtpUsecase";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";

export class ResendOtpUsecase implements IResendOtpUsecase {
  constructor(
    private readonly _otpService: IOtpService,
    private readonly _emailService: IEmailService,
    private readonly _authRepository: IAuthRepository,
  ) {}

  async execute(data: AuthRequestDTO): Promise<void> {
    const { name, email } = data;
    const existingUser = await this._authRepository.findByEmail(email);
    if (existingUser) {
      throw new CustomError(
        HttpStatusCodes.CONFLICT,
        MESSAGES.ACCOUNT_ALREADY_EXISTS,
      );
    }
    const otp = this._otpService.generateOtp(email);
    const emailOptions: IOtpEmailTemplate = {
      email,
      name: name!,
      otp,
      subject: "HealthHub signup OTP",
      body: "Please enter the above mentioned OTP for verifying your email and completing signup to HealthHub.",
    };
    await this._emailService.sendOtp(emailOptions);
  }
}
