import { EnrolOrganizationRequestDTO } from "../../../../application/DTOs/organization/organizationDTO";

export interface IEnrolOrganizationUsecase {
  execute(data: EnrolOrganizationRequestDTO): Promise<void>;
}
