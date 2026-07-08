import { IUpdateUploadedDocumentUseCase } from "../../../../domain/interfaces/usecases/patient/uploadedDocument/IUpdateUploadedDocumentUseCase";
import { IUploadedDocumentRepository } from "../../../../domain/interfaces/repositories/IUploadedDocumentRepository";
import { IS3Service } from "../../../../domain/interfaces/services/IS3Service";
import { UpdateUploadedDocumentDTO, UploadedDocumentDTO } from "../../../DTOs/patient/uploadedDocumentDTOs";
import { UploadedDocumentMapper } from "../../../mappers/uploadedDocumentMapper";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";

export class UpdateUploadedDocumentUseCase implements IUpdateUploadedDocumentUseCase {
  private readonly _uploadedDocumentRepository: IUploadedDocumentRepository;
  private readonly _s3Service: IS3Service;

  constructor(
    uploadedDocumentRepository: IUploadedDocumentRepository,
    s3Service: IS3Service
  ) {
    this._uploadedDocumentRepository = uploadedDocumentRepository;
    this._s3Service = s3Service;
  }

  async execute(
    id: string,
    patientId: string,
    data: UpdateUploadedDocumentDTO
  ): Promise<UploadedDocumentDTO> {
    const document = await this._uploadedDocumentRepository.findById(id);
    if (!document) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Document not found.");
    }

    if (document.patientId !== patientId) {
      throw new CustomError(
        HttpStatusCodes.FORBIDDEN,
        "You are not authorized to update this document."
      );
    }

    const isOtherCategory = data.category ? data.category.toLowerCase() === "other" : false;
    let customCategory = data.customCategory;
    if (data.category && !isOtherCategory) {
      customCategory = null;
    }

    const updatedDocument = await this._uploadedDocumentRepository.update(id, {
      title: data.title,
      category: data.category,
      customCategory: customCategory!,
      specializationId: data.specializationId!,
      customSpecialization: data.customSpecialization!,
      reportDate: data.reportDate ? new Date(data.reportDate) : undefined,
    });

    return UploadedDocumentMapper.toDTO(updatedDocument, this._s3Service);
  }
}
