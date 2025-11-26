export interface GetDoctorsRequestDTO {
  search: string;
  page: number;
  limit: number;
  sort: string;
  blocked?: boolean;
  unblocked?: boolean;
  newUser?: boolean;
}

export interface DoctorListItemDTO {
  id: string;
  name: string;
  email: string;
  isBlocked: boolean;
  isNewUser: boolean;
}

export interface GetDoctorsResponseDTO {
  doctors: DoctorListItemDTO[];
  totalDocumentCount: number;
}
