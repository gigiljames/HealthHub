import { UploadedDocumentListFilterDTO, PaginatedUploadedDocumentsDTO } from "../../../../../application/DTOs/patient/uploadedDocumentDTOs";

export interface IGetUploadedDocumentsUseCase {
  execute(
    patientId: string,
    page: number,
    limit: number,
    filters: UploadedDocumentListFilterDTO
  ): Promise<PaginatedUploadedDocumentsDTO>;
}
