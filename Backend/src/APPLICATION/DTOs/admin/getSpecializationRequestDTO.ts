import { specializationResponseDTO } from "./specializationDTO";

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
