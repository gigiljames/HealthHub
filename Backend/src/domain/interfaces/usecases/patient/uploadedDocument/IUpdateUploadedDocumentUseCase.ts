import { UpdateUploadedDocumentDTO, UploadedDocumentDTO } from "../../../../../application/DTOs/patient/uploadedDocumentDTOs";

export interface IUpdateUploadedDocumentUseCase {
  execute(
    id: string,
    patientId: string,
    data: UpdateUploadedDocumentDTO
  ): Promise<UploadedDocumentDTO>;
}
