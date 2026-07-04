import { OrganizationStatusResponseDTO } from "../../../../application/DTOs/organization/organizationDTO";

export interface ICheckStatusUsecase {
  execute(email: string, otp: string): Promise<OrganizationStatusResponseDTO>;
}
