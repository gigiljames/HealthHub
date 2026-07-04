import { getOrganizationsRequestDTO } from "../../../application/DTOs/organization/organizationDTO";
import { Organization } from "../../entities/organization";
import { TimePeriod } from "../../enums/timePeriod";
import { OrganizationTrendRaw } from "./adminDashboardRepositoryTypes";

export interface IOrganizationRepository {
  findById(id: string): Promise<Organization | null>;
  deleteById(id: string): Promise<void>;
  save(organization: Organization): Promise<Organization>;
  findAll(query?: getOrganizationsRequestDTO): Promise<{ organizations: Organization[]; total: number }>;
  findByEmail(email: string): Promise<Organization | null>;
  findByCode(code: string): Promise<Organization | null>;
  countAll(): Promise<number>;
  getRegistrationTrends(
    startDate: Date,
    endDate: Date,
    period: TimePeriod,
  ): Promise<OrganizationTrendRaw[]>;
}
