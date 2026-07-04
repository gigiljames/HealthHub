import { IGetUploadedDocumentsUseCase } from "../../../../domain/interfaces/usecases/patient/uploadedDocument/IGetUploadedDocumentsUseCase";
import { IUploadedDocumentRepository, IUploadedDocumentFilterParams } from "../../../../domain/interfaces/repositories/IUploadedDocumentRepository";
import { IS3Service } from "../../../../domain/interfaces/services/IS3Service";
import { UploadedDocumentListFilterDTO, PaginatedUploadedDocumentsDTO } from "../../../DTOs/patient/uploadedDocumentDTOs";
import { UploadedDocumentMapper } from "../../../mappers/uploadedDocumentMapper";

export class GetUploadedDocumentsUseCase implements IGetUploadedDocumentsUseCase {
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
    patientId: string,
    page: number,
    limit: number,
    filters: UploadedDocumentListFilterDTO
  ): Promise<PaginatedUploadedDocumentsDTO> {
    const repoFilters: IUploadedDocumentFilterParams = {
      search: filters.search,
      category: filters.category,
      specialization: filters.specialization,
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(`${filters.endDate}T23:59:59.999Z`) : undefined,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    };

    const result = await this._uploadedDocumentRepository.getPatientDocuments(
      patientId,
      page,
      limit,
      repoFilters
    );

    const documentDTOs = await Promise.all(
      result.documents.map((doc) => UploadedDocumentMapper.toDTO(doc, this._s3Service))
    );

    return {
      documents: documentDTOs,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
