import { ICreateUploadedDocumentUseCase } from "../../../../domain/interfaces/usecases/patient/uploadedDocument/ICreateUploadedDocumentUseCase";
import { IUploadedDocumentRepository } from "../../../../domain/interfaces/repositories/IUploadedDocumentRepository";
import { IS3Service } from "../../../../domain/interfaces/services/IS3Service";
import { CreateUploadedDocumentDTO, UploadedDocumentDTO } from "../../../DTOs/patient/uploadedDocumentDTOs";
import { UploadedDocument } from "../../../../domain/entities/uploadedDocument";
import { UploadedDocumentMapper } from "../../../mappers/uploadedDocumentMapper";

export class CreateUploadedDocumentUseCase implements ICreateUploadedDocumentUseCase {
  private readonly _uploadedDocumentRepository: IUploadedDocumentRepository;
  private readonly _s3Service: IS3Service;

  constructor(
    uploadedDocumentRepository: IUploadedDocumentRepository,
    s3Service: IS3Service
  ) {
    this._uploadedDocumentRepository = uploadedDocumentRepository;
    this._s3Service = s3Service;
  }

  async execute(data: CreateUploadedDocumentDTO): Promise<UploadedDocumentDTO> {
    const entity = new UploadedDocument({
      patientId: data.patientId,
      title: data.title,
      category: data.category,
      customCategory: data.customCategory,
      specializationId: data.specializationId,
      customSpecialization: data.customSpecialization,
      fileKey: data.fileKey,
      thumbnailKey: data.thumbnailKey,
      reportDate: new Date(data.reportDate),
    });

    const createdEntity = await this._uploadedDocumentRepository.create(entity);
    return UploadedDocumentMapper.toDTO(createdEntity, this._s3Service);
  }
}
