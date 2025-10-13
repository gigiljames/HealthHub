import { Roles } from "../../../DOMAIN/enums/roles";

export interface GoogleAuthRequestDTO {
  token: string;
  role: Roles;
}
