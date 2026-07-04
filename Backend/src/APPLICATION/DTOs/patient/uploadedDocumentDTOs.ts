export interface CreateUploadedDocumentDTO {
  patientId: string;
  title: string;
  category: string;
  customCategory?: string;
  specializationId?: string;
  customSpecialization?: string;
  fileKey: string;
  thumbnailKey: string;
  reportDate: string;
}

export interface UpdateUploadedDocumentDTO {
  title?: string;
  category?: string;
  customCategory?: string | null;
  specializationId?: string | null;
  customSpecialization?: string | null;
  reportDate?: string;
}

export interface UploadedDocumentDTO {
  id: string;
  patientId: string;
  title: string;
  category: string;
  customCategory?: string;
  specializationId?: string;
  customSpecialization?: string;
  fileKey: string;
  thumbnailKey: string;
  fileUrl: string;
  thumbnailUrl: string;
  reportDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadedDocumentListFilterDTO {
  search?: string;
  category?: string;
  specialization?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: "reportDate" | "createdAt";
  sortOrder?: "asc" | "desc";
  patientId?: string;
}

export interface PaginatedUploadedDocumentsDTO {
  documents: UploadedDocumentDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
