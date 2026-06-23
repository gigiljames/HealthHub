import { IOrganizationRepository } from "../../../domain/interfaces/repositories/IOrganizationRepository";
import { IOtpService } from "../../../domain/interfaces/services/IOtpService";
import { IEmailService } from "../../../domain/interfaces/services/IEmailService";
import { IEnrolOrganizationUsecase } from "../../../domain/interfaces/usecases/organization/IEnrolOrganizationUsecase";
import { EnrolOrganizationRequestDTO } from "../../DTOs/organization/organizationDTO";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";

export class EnrolOrganizationUseCase implements IEnrolOrganizationUsecase {
  constructor(
    private readonly _organizationRepository: IOrganizationRepository,
    private readonly _otpService: IOtpService,
    private readonly _emailService: IEmailService,
  ) { }

  async execute(data: EnrolOrganizationRequestDTO): Promise<void> {
    const existingOrgByEmail = await this._organizationRepository.findByEmail(data.email);
    if (existingOrgByEmail) {
      if (existingOrgByEmail.verificationStatus === "REJECTED") {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          "This organization registration was rejected. Please use the Status Check page to edit and resubmit.",
        );
      }
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        "An organization with this email address is already registered or pending.",
      );
    }

    const { organizations } = await this._organizationRepository.findAll({ search: data.name });
    const nameMatch = organizations.find((o) => o.name.toLowerCase() === data.name.toLowerCase());
    if (nameMatch) {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        "An organization with this name is already registered.",
      );
    }

    const otp = this._otpService.generateOtp(data.email);
    await this._emailService.sendOtp({
      name: data.accountHolderName,
      email: data.email,
      otp,
      subject: "HealthHub Organization Enrolment OTP",
      body: "Please enter the OTP below to verify your email and submit your organization enrolment request.",
    });
  }
}
