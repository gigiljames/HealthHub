import { getOrganizationsRequestDTO } from "../../../application/DTOs/organization/organizationDTO";
import { Organization } from "../../entities/organization";

export interface IOrganizationRepository {
  findById(id: string): Promise<Organization | null>;
  deleteById(id: string): Promise<void>;
  save(organization: Organization): Promise<Organization>;
  findAll(query?: getOrganizationsRequestDTO): Promise<Organization[]>;
}
