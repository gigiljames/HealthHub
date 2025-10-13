import { AuthRequestDTO } from "../../../../APPLICATION/DTOs/auth/authDTO";

export interface ISignupUsecase {
  execute(data: AuthRequestDTO): Promise<void>;
}
