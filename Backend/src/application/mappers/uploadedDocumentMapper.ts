import { UploadedDocument } from "../../domain/entities/uploadedDocument";
import { UploadedDocumentDTO } from "../DTOs/patient/uploadedDocumentDTOs";
import { IS3Service } from "../../domain/interfaces/services/IS3Service";

export class UploadedDocumentMapper {
  static async toDTO(
    entity: UploadedDocument,
    s3Service: IS3Service
  ): Promise<UploadedDocumentDTO> {
    // For inline viewing of both the file and thumbnail, we pass "inline" as the contentDisposition
    const fileUrl = await s3Service.getAccessSignedUrl(entity.fileKey, "inline");
    const thumbnailUrl = await s3Service.getAccessSignedUrl(entity.thumbnailKey, "inline");

    return {
      id: entity.id || "",
      patientId: entity.patientId,
      title: entity.title,
      category: entity.category,
      customCategory: entity.customCategory,
      specializationId: entity.specializationId,
      customSpecialization: entity.customSpecialization,
      fileKey: entity.fileKey,
      thumbnailKey: entity.thumbnailKey,
      fileUrl,
      thumbnailUrl,
      reportDate: entity.reportDate.toISOString(),
      createdAt: entity.createdAt ? entity.createdAt.toISOString() : "",
      updatedAt: entity.updatedAt ? entity.updatedAt.toISOString() : "",
    };
  }
}
