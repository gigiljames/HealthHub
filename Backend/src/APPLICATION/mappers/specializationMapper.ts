import Specialization from "../../domain/entities/specialization";
import { ISpecializationDocument } from "../../infrastructure/DB/models/specializationModel";
import { specializationResponseDTO } from "../DTOs/admin/specializationDTO";
import { SpecializationListDTO } from "../DTOs/specializationDTO";

export class SpecializationMapper {
  static toEntityFromDocument(doc: ISpecializationDocument): Specialization {
    return new Specialization({
      id: doc._id?.toString(),
      name: doc.name,
      description: doc.description,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  static toSpecializationResponseDTOFromEntity(
    spec: Specialization
  ): specializationResponseDTO {
    return {
      id: spec.id!,
      name: spec.name,
      description: spec.description,
      isActive: spec.isActive,
      createdAt: spec.createdAt,
      updatedAt: spec.updatedAt,
    };
  }

  static toSpecializationListDTOFromDocument(
    spec: ISpecializationDocument
  ): SpecializationListDTO {
    return {
      id: spec._id?.toString()!,
      name: spec.name,
    };
  }
}
