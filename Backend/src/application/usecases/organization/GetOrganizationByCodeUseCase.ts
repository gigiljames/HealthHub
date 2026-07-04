import { IOrganizationRepository } from "../../../domain/interfaces/repositories/IOrganizationRepository";
import { IGetOrganizationByCodeUsecase } from "../../../domain/interfaces/usecases/organization/IGetOrganizationByCodeUsecase";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";

export class GetOrganizationByCodeUseCase implements IGetOrganizationByCodeUsecase {
  constructor(private readonly _organizationRepository: IOrganizationRepository) {}

  async execute(code: string, type?: string): Promise<{ name: string; id: string }> {
    const organization = await this._organizationRepository.findByCode(code.toUpperCase());
    if (!organization) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "No organization found with this code.");
    }

    if (organization.verificationStatus !== "VERIFIED") {
      throw new CustomError(HttpStatusCodes.BAD_REQUEST, "Organization registration is not verified.");
    }

    if (organization.isBlocked) {
      throw new CustomError(HttpStatusCodes.BAD_REQUEST, "Organization is currently blocked by administration.");
    }

    if (type && organization.organizationType !== type.toUpperCase()) {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        `Organization type mismatch. Selected practice type is ${type}, but organization code is registered as a ${organization.organizationType}.`
      );
    }

    return {
      name: organization.name,
      id: organization.id!,
    };
  }
}
