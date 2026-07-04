import { Roles } from "../../../enums/roles";

export interface IResetPasswordUsecase {
  execute(password: string, email: string, token: string): Promise<Roles>;
}
