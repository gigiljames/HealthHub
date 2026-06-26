import { CreateUploadedDocumentDTO, UploadedDocumentDTO } from "../../../../../application/DTOs/patient/uploadedDocumentDTOs";

export interface ICreateUploadedDocumentUseCase {
  execute(data: CreateUploadedDocumentDTO): Promise<UploadedDocumentDTO>;
}
