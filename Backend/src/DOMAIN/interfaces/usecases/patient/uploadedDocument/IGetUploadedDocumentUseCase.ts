import { UploadedDocumentDTO } from "../../../../../application/DTOs/patient/uploadedDocumentDTOs";

export interface IGetUploadedDocumentUseCase {
  execute(
    id: string,
    userId: string,
    role: string
  ): Promise<UploadedDocumentDTO>;
}
