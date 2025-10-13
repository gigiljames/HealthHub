import Specialization from "../../DOMAIN/entities/specialization";
import { ISpecializationDocument } from "../../INFRASTRUCTURE/DB/models/specializationModel";
import { specializationResponseDTO } from "../DTOs/admin/specializationDTO";

export class SpecializationMapper {
  static toEntityFromDocument(doc: ISpecializationDocument): Specialization {
    return new Specialization({
      id: JSON.stringify(doc._id),
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
      id: spec.id,
      name: spec.name,
      description: spec.description,
      isActive: spec.isActive,
      createdAt: spec.createdAt,
      updatedAt: spec.updatedAt,
    };
  }
}
