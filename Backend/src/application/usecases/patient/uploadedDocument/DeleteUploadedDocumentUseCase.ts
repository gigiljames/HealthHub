import { IDeleteUploadedDocumentUseCase } from "../../../../domain/interfaces/usecases/patient/uploadedDocument/IDeleteUploadedDocumentUseCase";
import { IUploadedDocumentRepository } from "../../../../domain/interfaces/repositories/IUploadedDocumentRepository";
import { IS3Service } from "../../../../domain/interfaces/services/IS3Service";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";

export class DeleteUploadedDocumentUseCase implements IDeleteUploadedDocumentUseCase {
  private readonly _uploadedDocumentRepository: IUploadedDocumentRepository;
  private readonly _s3Service: IS3Service;

  constructor(
    uploadedDocumentRepository: IUploadedDocumentRepository,
    s3Service: IS3Service
  ) {
    this._uploadedDocumentRepository = uploadedDocumentRepository;
    this._s3Service = s3Service;
  }

  async execute(id: string, patientId: string): Promise<void> {
    const document = await this._uploadedDocumentRepository.findById(id);
    if (!document) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Document not found.");
    }

    if (document.patientId !== patientId) {
      throw new CustomError(
        HttpStatusCodes.FORBIDDEN,
        "You are not authorized to delete this document."
      );
    }

    await this._uploadedDocumentRepository.deleteById(id);

    try {
      if (document.fileKey) {
        await this._s3Service.deleteFile(document.fileKey);
      }
      if (document.thumbnailKey) {
        await this._s3Service.deleteFile(document.thumbnailKey);
      }
    } catch (s3Error) {
      console.error("Failed to delete files from S3 during document deletion:", s3Error);
    }
  }
}
