import { Roles } from "../../../domain/enums/roles";

export interface AuthRequestDTO {
  name?: string;
  email: string;
  role: Roles;
  password?: string;
}

export interface AuthResponseDTO {
  id: string;
  name: string;
  email: string;
  role: Roles;
  isNewUser: boolean;
}
