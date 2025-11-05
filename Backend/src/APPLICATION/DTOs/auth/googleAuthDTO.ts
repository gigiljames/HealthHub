import { Roles } from "../../../domain/enums/roles";

export interface GoogleAuthRequestDTO {
  token: string;
  role: Roles;
}
