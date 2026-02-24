export interface SpecializationListDTO {
  id: string;
  name: string;
}

export interface specializationRequestDTO {
  id?: string;
  name: string;
  description: string;
}

export interface specializationResponseDTO {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface changeSpecializationStatusRequestDTO {
  id: string;
}

export interface GetSpecializationRequestDTO {
  search: string;
  page: number;
  limit: number;
  sort: string;
}

export interface GetSpecializationResponseDTO {
  specializations: specializationResponseDTO[];
  totalDocumentCount: number;
}
