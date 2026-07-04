import { AdminOrganizationDetailsDTO } from "../../../../application/DTOs/organization/organizationDTO";

export interface IGetOrganizationByIdUsecase {
  execute(id: string): Promise<AdminOrganizationDetailsDTO>;
}
