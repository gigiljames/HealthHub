import { IOrganizationRepository } from "../../domain/interfaces/repositories/IOrganizationRepository";
import { Organization } from "../../domain/entities/organization";
import { OrganizationModel } from "../DB/models/organizationModel";
import { OrganizationMapper } from "../../application/mappers/organizationMapper";
import { getOrganizationsRequestDTO } from "../../application/DTOs/organization/organizationDTO";

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
  async findAll(query?: getOrganizationsRequestDTO): Promise<Organization[]> {
    if (query) {
      const page = query.page || 1;
      const limit = query.limit || 10;
      const search = query.search || "";
      const organizationType = query.organizationType || "";
      const isBlocked = query.isBlocked || false;
      const organizations = await OrganizationModel.find({
        name: { $regex: search, $options: "i" },
        organizationType: organizationType,
        isBlocked: isBlocked,
      })
        .skip((page - 1) * limit)
        .limit(limit);
      return OrganizationMapper.toEntityListFromDocumentList(organizations);
    }
    const organizations = await OrganizationModel.find({ isBlocked: false });
    return OrganizationMapper.toEntityListFromDocumentList(organizations);
  }
}
