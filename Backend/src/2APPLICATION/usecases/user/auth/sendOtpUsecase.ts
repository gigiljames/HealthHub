import { IOtpEmailTemplate } from "../../../../1DOMAIN/interfaces/emailTemplates/IOtpEmailTemplate";
import { IEmailService } from "../../../../1DOMAIN/interfaces/services/IEmailService";
import { IOtpService } from "../../../../1DOMAIN/interfaces/services/IOtpService";
import { ISendOtpUsecase } from "../../../../1DOMAIN/interfaces/usecases/user/auth/ISendOtpUsecase";

export class SendOtpUsecase implements ISendOtpUsecase {
  constructor(
    private otpService: IOtpService,
    private emailService: IEmailService
  ) {}
  async execute(name: string, email: string) {
    const otp = this.otpService.generateOtp();
    const emailOptions: IOtpEmailTemplate = {
      email: email,
      name: name,
      otp: otp,
      subject: "HealthHub signup OTP",
    };
    await this.emailService.sendOtp(emailOptions);
  }
}
