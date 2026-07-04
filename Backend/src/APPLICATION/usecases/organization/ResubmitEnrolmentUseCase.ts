import { IOrganizationRepository } from "../../../domain/interfaces/repositories/IOrganizationRepository";
import { IOtpService } from "../../../domain/interfaces/services/IOtpService";
import { IResubmitEnrolmentUsecase } from "../../../domain/interfaces/usecases/organization/IResubmitEnrolmentUsecase";
import { ResubmitEnrolmentRequestDTO } from "../../DTOs/organization/organizationDTO";
import { OrganizationType } from "../../../domain/enums/organizationType";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";

export class ResubmitEnrolmentUseCase implements IResubmitEnrolmentUsecase {
  constructor(
    private readonly _organizationRepository: IOrganizationRepository,
    private readonly _otpService: IOtpService,
  ) { }

  async execute(data: ResubmitEnrolmentRequestDTO): Promise<void> {
    const isOtpValid = this._otpService.verifyOtp(data.otp, data.email);
    if (!isOtpValid) {
      throw new CustomError(HttpStatusCodes.UNAUTHORIZED, "Invalid or expired OTP.");
    }

    const organization = await this._organizationRepository.findByEmail(data.email);
    if (!organization) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Organization not found.");
    }

    if (organization.verificationStatus !== "REJECTED") {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        "Only rejected organizations can resubmit enrolment details.",
      );
    }

    organization.name = data.enrolData.name;
    organization.organizationType = data.enrolData.organizationType as OrganizationType;
    organization.location = data.enrolData.location
      ? {
        type: "Point",
        coordinates: data.enrolData.location.coordinates,
        address: data.enrolData.location.address,
        placeId: data.enrolData.location.placeId,
      }
      : undefined;
    organization.accountHolderName = data.enrolData.accountHolderName;
    organization.bankName = data.enrolData.bankName;
    organization.accountNumber = data.enrolData.accountNumber;
    organization.ifscCode = data.enrolData.ifscCode;
    organization.upiId = data.enrolData.upiId;

    organization.verificationStatus = "PENDING";
    organization.rejectionReason = undefined;
    organization.submissionHistory = [
      ...(organization.submissionHistory || []),
      {
        submittedAt: new Date(),
        status: "PENDING"
      }
    ];
    organization.updatedAt = new Date();

    await this._organizationRepository.save(organization);
  }
}
