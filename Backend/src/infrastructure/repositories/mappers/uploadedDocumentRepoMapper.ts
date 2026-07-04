import { IUploadedDocumentDocument } from "../../DB/models/uploadedDocumentModel";
import { UploadedDocument } from "../../../domain/entities/uploadedDocument";

export class UploadedDocumentRepoMapper {
  static toEntityFromDocument(doc: IUploadedDocumentDocument): UploadedDocument {
    return new UploadedDocument({
      id: doc._id.toString(),
      patientId: doc.patientId.toString(),
      title: doc.title,
      category: doc.category,
      customCategory: doc.customCategory,
      specializationId: doc.specializationId?.toString(),
      customSpecialization: doc.customSpecialization,
      fileKey: doc.fileKey,
      thumbnailKey: doc.thumbnailKey,
      reportDate: doc.reportDate,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
