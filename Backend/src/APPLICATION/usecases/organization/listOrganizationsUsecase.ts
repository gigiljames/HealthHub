import { IOrganizationRepository } from "../../../domain/interfaces/repositories/IOrganizationRepository";
import { IListOrganizationUsecase } from "../../../domain/interfaces/usecases/organization/IListOrganizationUsecase";
import { listOrganizationsDTO } from "../../DTOs/organization/organizationDTO";
import { OrganizationMapper } from "../../mappers/organizationMapper";

export class ListOrganizationsUsecase implements IListOrganizationUsecase {
  constructor(private _organizationRepository: IOrganizationRepository) {}

  async execute(): Promise<listOrganizationsDTO[]> {
    const organizations = await this._organizationRepository.findAll();
    return OrganizationMapper.toListOrganizationsDTOFromEntityList(
      organizations,
    );
  }
}
