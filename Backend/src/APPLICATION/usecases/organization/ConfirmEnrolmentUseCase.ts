import { IOrganizationRepository } from "../../../domain/interfaces/repositories/IOrganizationRepository";
import { IOtpService } from "../../../domain/interfaces/services/IOtpService";
import { IConfirmEnrolmentUsecase } from "../../../domain/interfaces/usecases/organization/IConfirmEnrolmentUsecase";
import { ConfirmEnrolmentRequestDTO } from "../../DTOs/organization/organizationDTO";
import { Organization } from "../../../domain/entities/organization";
import { OrganizationType } from "../../../domain/enums/organizationType";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";

export class ConfirmEnrolmentUseCase implements IConfirmEnrolmentUsecase {
  constructor(
    private readonly _organizationRepository: IOrganizationRepository,
    private readonly _otpService: IOtpService,
  ) { }

  async execute(data: ConfirmEnrolmentRequestDTO): Promise<void> {
    const isOtpValid = this._otpService.verifyOtp(data.otp, data.email);
    if (!isOtpValid) {
      throw new CustomError(HttpStatusCodes.UNAUTHORIZED, "Invalid or expired OTP.");
    }

    const organization = new Organization({
      name: data.enrolData.name,
      organizationType: data.enrolData.organizationType as OrganizationType,
      location: data.enrolData.location
        ? {
          type: "Point",
          coordinates: data.enrolData.location.coordinates,
          address: data.enrolData.location.address,
          placeId: data.enrolData.location.placeId,
        }
        : undefined,
      accountHolderName: data.enrolData.accountHolderName,
      bankName: data.enrolData.bankName,
      accountNumber: data.enrolData.accountNumber,
      ifscCode: data.enrolData.ifscCode,
      upiId: data.enrolData.upiId,
      isVerified: false,
      isBlocked: false,
      email: data.email,
      verificationStatus: "PENDING",
      submissionHistory: [
        {
          submittedAt: new Date(),
          status: "PENDING"
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this._organizationRepository.save(organization);
  }
}
