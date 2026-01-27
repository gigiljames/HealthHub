import { Organization } from "../../entities/organization";

export interface IOrganizationRepository {
  findById(id: string): Promise<Organization | null>;
  deleteById(id: string): Promise<void>;
  save(organization: Organization): Promise<Organization>;
  findAll(): Promise<Organization[]>;
}
