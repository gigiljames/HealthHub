import { IOrganizationRepository } from "../../domain/interfaces/repositories/IOrganizationRepository";
import { Organization } from "../../domain/entities/organization";
import {
  OrganizationModel,
  IOrganizationDocument,
} from "../DB/models/organizationModel";
import { OrganizationMapper } from "../../application/mappers/organizationMapper";
import { getOrganizationsRequestDTO } from "../../application/DTOs/organization/organizationDTO";
import { BaseRepository } from "./base/BaseRepository";
import { MESSAGES } from "../../domain/constants/messages";

export class OrganizationRepository
  extends BaseRepository<IOrganizationDocument>
  implements IOrganizationRepository
{
  constructor() {
    super(OrganizationModel);
  }
  async findById(id: string): Promise<Organization | null> {
    const organization = await this.findDocumentById(id);
    return organization
      ? OrganizationMapper.toEntityFromDocument(organization)
      : null;
  }
  async save(organization: Organization): Promise<Organization> {
    throw new Error(MESSAGES.NOT_IMPLEMENTED);
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
