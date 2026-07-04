export interface IDeleteUploadedDocumentUseCase {
  execute(id: string, patientId: string): Promise<void>;
}
