import { IBaseRepository } from "./IBaseRepository";
import { UploadedDocument } from "../../entities/uploadedDocument";

export interface IUploadedDocumentFilterParams {
  search?: string;
  category?: string;
  specialization?: string;
  startDate?: Date;
  endDate?: Date;
  sortBy?: "reportDate" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface IPaginatedUploadedDocuments {
  documents: UploadedDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IUploadedDocumentRepository extends IBaseRepository<UploadedDocument> {
  create(data: Partial<UploadedDocument>): Promise<UploadedDocument>;
  findById(id: string): Promise<UploadedDocument | null>;
  update(id: string, data: Partial<UploadedDocument>): Promise<UploadedDocument>;
  deleteById(id: string): Promise<void>;
  getPatientDocuments(
    patientId: string,
    page: number,
    limit: number,
    filters: IUploadedDocumentFilterParams
  ): Promise<IPaginatedUploadedDocuments>;
}
