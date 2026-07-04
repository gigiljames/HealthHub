import { Organization } from "../../domain/entities/organization";
import { IOrganizationDocument } from "../../infrastructure/DB/models/organizationModel";
import {
  listOrganizationsDTO,
  AdminOrganizationDetailsDTO,
  OrganizationStatusResponseDTO,
} from "../DTOs/organization/organizationDTO";

export class OrganizationMapper {
  static toEntityFromDocument(doc: IOrganizationDocument) {
    return new Organization({
      id: doc._id?.toString(),
      name: doc.name,
      organizationType: doc.organizationType,
      location: doc.location
        ? {
            type: doc.location.type,
            coordinates: doc.location.coordinates,
            address: doc.location.address,
            placeId: doc.location.placeId,
          }
        : undefined,
      accountHolderName: doc.accountHolderName,
      bankName: doc.bankName,
      accountNumber: doc.accountNumber,
      ifscCode: doc.ifscCode,
      upiId: doc.upiId,
      isVerified: doc.isVerified,
      isBlocked: doc.isBlocked,
      email: doc.email,
      organizationCode: doc.organizationCode || undefined,
      verificationStatus: doc.verificationStatus,
      rejectionReason: doc.rejectionReason || undefined,
      submissionHistory: doc.submissionHistory?.map((hist) => ({
        submittedAt: hist.submittedAt,
        status: hist.status,
        rejectionReason: hist.rejectionReason || undefined,
      })) || [],
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
      address: entity.location?.address ?? "",
      organizationType: entity.organizationType,
    };
  }

  static toAdminDetailsDTO(entity: Organization): AdminOrganizationDetailsDTO {
    return {
      id: entity.id!,
      name: entity.name,
      email: entity.email,
      organizationType: entity.organizationType,
      location: entity.location
        ? {
            type: "Point",
            coordinates: entity.location.coordinates,
            address: entity.location.address,
            placeId: entity.location.placeId,
          }
        : undefined,
      accountHolderName: entity.accountHolderName,
      bankName: entity.bankName,
      accountNumber: entity.accountNumber,
      ifscCode: entity.ifscCode,
      upiId: entity.upiId,
      isVerified: entity.isVerified,
      isBlocked: entity.isBlocked,
      verificationStatus: entity.verificationStatus,
      rejectionReason: entity.rejectionReason,
      organizationCode: entity.organizationCode,
      submissionHistory: entity.submissionHistory?.map((hist) => ({
        submittedAt: hist.submittedAt.toISOString(),
        status: hist.status,
        rejectionReason: hist.rejectionReason,
      })) || [],
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  static toAdminDetailsDTOList(
    entities: Organization[],
  ): AdminOrganizationDetailsDTO[] {
    return entities.map((e) => this.toAdminDetailsDTO(e));
  }

  static toStatusResponseDTO(
    entity: Organization,
  ): OrganizationStatusResponseDTO {
    return {
      id: entity.id!,
      name: entity.name,
      email: entity.email,
      organizationType: entity.organizationType,
      location: entity.location
        ? {
            coordinates: entity.location.coordinates,
            address: entity.location.address,
            placeId: entity.location.placeId,
          }
        : undefined,
      accountHolderName: entity.accountHolderName,
      bankName: entity.bankName,
      accountNumber: entity.accountNumber,
      ifscCode: entity.ifscCode,
      upiId: entity.upiId,
      isVerified: entity.isVerified,
      isBlocked: entity.isBlocked,
      verificationStatus: entity.verificationStatus,
      rejectionReason: entity.rejectionReason,
      organizationCode: entity.organizationCode,
      submissionHistory: entity.submissionHistory?.map((hist) => ({
        submittedAt: hist.submittedAt.toISOString(),
        status: hist.status,
        rejectionReason: hist.rejectionReason,
      })) || [],
    };
  }
}
