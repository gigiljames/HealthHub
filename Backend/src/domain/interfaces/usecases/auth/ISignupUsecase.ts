import { AuthRequestDTO } from "../../../../application/DTOs/auth/authDTO";

export interface ISignupUsecase {
  execute(data: AuthRequestDTO): Promise<void>;
}
