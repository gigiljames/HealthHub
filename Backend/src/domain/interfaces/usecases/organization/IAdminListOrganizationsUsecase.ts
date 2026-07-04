import {
  getOrganizationsRequestDTO,
  AdminListOrganizationsResponseDTO,
} from "../../../../application/DTOs/organization/organizationDTO";

export interface IAdminListOrganizationsUsecase {
  execute(query: getOrganizationsRequestDTO): Promise<AdminListOrganizationsResponseDTO>;
}
