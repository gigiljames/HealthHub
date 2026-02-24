export interface listOrganizationsDTO {
  id: string;
  name: string;
  address: string;
  organizationType: string;
}

export interface getOrganizationsRequestDTO {
  page?: number;
  limit?: number;
  search?: string;
  organizationType?: string;
  isBlocked?: boolean;
}
