import { Roles } from "../../../domain/enums/roles";

export interface CompleteSignupRequestDTO {
  name: string;
  email: string;
  password: string;
  role: Roles;
  otp: string;
}
