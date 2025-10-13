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
