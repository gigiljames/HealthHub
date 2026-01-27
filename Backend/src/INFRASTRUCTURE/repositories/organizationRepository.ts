import { IOrganizationRepository } from "../../domain/interfaces/repositories/IOrganizationRepository";
import { Organization } from "../../domain/entities/organization";
import { OrganizationModel } from "../DB/models/organizationModel";
import { OrganizationMapper } from "../../application/mappers/organizationMapper";

export class OrganizationRepository implements IOrganizationRepository {
  async findById(id: string): Promise<Organization | null> {
    const organization = await OrganizationModel.findById(id);
    if (!organization) {
      return null;
    }
    return OrganizationMapper.toEntityFromDocument(organization);
  }
  async deleteById(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async save(organization: Organization): Promise<Organization> {
    throw new Error("Method not implemented.");
  }
  async findAll(): Promise<Organization[]> {
    const organizations = await OrganizationModel.find();
    return OrganizationMapper.toEntityListFromDocumentList(organizations);
  }
}
