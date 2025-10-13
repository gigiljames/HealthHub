import { AuthRequestDTO } from "../../DTOs/auth/authDTO";
import { IOtpEmailTemplate } from "../../../DOMAIN/interfaces/emailTemplates/IOtpEmailTemplate";
import { IAuthRepository } from "../../../DOMAIN/interfaces/repositories/IAuthRepository";
import { IEmailService } from "../../../DOMAIN/interfaces/services/IEmailService";
import { IOtpService } from "../../../DOMAIN/interfaces/services/IOtpService";
import { ISignupUsecase } from "../../../DOMAIN/interfaces/usecases/auth/ISignupUsecase";
import { CustomError } from "../../../DOMAIN/entities/customError";
import { HttpStatusCodes } from "../../../DOMAIN/enums/httpStatusCodes";
import { MESSAGES } from "../../../DOMAIN/constants/messages";

export class SignupUsecase implements ISignupUsecase {
  constructor(
    private _otpService: IOtpService,
    private _emailService: IEmailService,
    private _authRepository: IAuthRepository
  ) {}
  async execute(data: AuthRequestDTO): Promise<void> {
    const { name, email, role } = data;

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
