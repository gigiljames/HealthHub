import { listOrganizationsDTO } from "../../../../application/DTOs/organization/organizationDTO";

export interface IListOrganizationUsecase {
  execute(): Promise<listOrganizationsDTO[]>;
}
