import { IOrganizationRepository } from "../../../domain/interfaces/repositories/IOrganizationRepository";
import { IOtpService } from "../../../domain/interfaces/services/IOtpService";
import { IEmailService } from "../../../domain/interfaces/services/IEmailService";
import { ISendStatusOtpUsecase } from "../../../domain/interfaces/usecases/organization/ISendStatusOtpUsecase";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";

export class SendStatusOtpUseCase implements ISendStatusOtpUsecase {
  constructor(
    private readonly _organizationRepository: IOrganizationRepository,
    private readonly _otpService: IOtpService,
    private readonly _emailService: IEmailService,
  ) {}

  async execute(email: string): Promise<void> {
    // 1. Verify organization exists
    const organization = await this._organizationRepository.findByEmail(email);
    if (!organization) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "No organization found with this email address.");
    }

    // 2. Generate and send OTP
    const otp = this._otpService.generateOtp(email);
    await this._emailService.sendOtp({
      name: organization.accountHolderName,
      email: organization.email,
      otp,
      subject: "HealthHub Organization Status Check OTP",
      body: "Please enter the OTP below to verify your email and check your organization registration status.",
    });
  }
}
