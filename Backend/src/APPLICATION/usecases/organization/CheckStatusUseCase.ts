import { IOrganizationRepository } from "../../../domain/interfaces/repositories/IOrganizationRepository";
import { IOtpService } from "../../../domain/interfaces/services/IOtpService";
import { ICheckStatusUsecase } from "../../../domain/interfaces/usecases/organization/ICheckStatusUsecase";
import { OrganizationStatusResponseDTO } from "../../DTOs/organization/organizationDTO";
import { OrganizationMapper } from "../../mappers/organizationMapper";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";

export class CheckStatusUseCase implements ICheckStatusUsecase {
  constructor(
    private readonly _organizationRepository: IOrganizationRepository,
    private readonly _otpService: IOtpService,
  ) { }

  async execute(email: string, otp: string): Promise<OrganizationStatusResponseDTO> {
    const isOtpValid = this._otpService.verifyOtp(otp, email);
    if (!isOtpValid) {
      throw new CustomError(HttpStatusCodes.UNAUTHORIZED, "Invalid or expired OTP.");
    }

    const organization = await this._organizationRepository.findByEmail(email);
    if (!organization) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Organization not found.");
    }

    return OrganizationMapper.toStatusResponseDTO(organization);
  }
}
