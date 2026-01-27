import { Organization } from "../../domain/entities/organization";
import { IOrganizationDocument } from "../../infrastructure/DB/models/organizationModel";
import { listOrganizationsDTO } from "../DTOs/organization/organizationDTO";

export class OrganizationMapper {
  static toEntityFromDocument(doc: IOrganizationDocument) {
    return new Organization({
      id: doc._id?.toString(),
      name: doc.name,
      organizationType: doc.organizationType,
      location: doc.location,
      accountHolderName: doc.accountHolderName,
      bankName: doc.bankName,
      accountNumber: doc.accountNumber,
      ifscCode: doc.ifscCode,
      upiId: doc.upiId,
      isVerified: doc.isVerified,
      isBlocked: doc.isBlocked,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  static toEntityListFromDocumentList(docList: IOrganizationDocument[]) {
    return docList.map((doc) => this.toEntityFromDocument(doc));
  }

  static toListOrganizationsDTOFromEntityList(entityList: Organization[]) {
    return entityList.map((entity) =>
      this.toListOrganizationsDTOFromEntity(entity),
    );
  }

  static toListOrganizationsDTOFromEntity(
    entity: Organization,
  ): listOrganizationsDTO {
    return {
      id: entity.id!,
      name: entity.name,
      address: entity.location?.address!,
      organizationType: entity.organizationType,
    };
  }
}
