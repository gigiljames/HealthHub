import { IOrganizationRepository } from "../../../domain/interfaces/repositories/IOrganizationRepository";
import { IGetOrganizationByIdUsecase } from "../../../domain/interfaces/usecases/organization/IGetOrganizationByIdUsecase";
import { AdminOrganizationDetailsDTO } from "../../DTOs/organization/organizationDTO";
import { OrganizationMapper } from "../../mappers/organizationMapper";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";

export class GetOrganizationByIdUseCase implements IGetOrganizationByIdUsecase {
  constructor(private readonly _organizationRepository: IOrganizationRepository) {}

  async execute(id: string): Promise<AdminOrganizationDetailsDTO> {
    const organization = await this._organizationRepository.findById(id);
    if (!organization) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Organization not found.");
    }
    return OrganizationMapper.toAdminDetailsDTO(organization);
  }
}
