import { IOrganizationRepository } from "../../../domain/interfaces/repositories/IOrganizationRepository";
import { IAdminListOrganizationsUsecase } from "../../../domain/interfaces/usecases/organization/IAdminListOrganizationsUsecase";
import {
  getOrganizationsRequestDTO,
  AdminListOrganizationsResponseDTO,
} from "../../DTOs/organization/organizationDTO";
import { OrganizationMapper } from "../../mappers/organizationMapper";

export class AdminListOrganizationsUseCase implements IAdminListOrganizationsUsecase {
  constructor(private readonly _organizationRepository: IOrganizationRepository) {}

  async execute(query: getOrganizationsRequestDTO): Promise<AdminListOrganizationsResponseDTO> {
    const { organizations, total } = await this._organizationRepository.findAll(query);
    const limit = query.limit || 10;
    const pages = Math.ceil(total / limit);

    return {
      organizations: OrganizationMapper.toAdminDetailsDTOList(organizations),
      total,
      pages,
    };
  }
}
