import { AuthRequestDTO } from "../../../../application/DTOs/auth/authDTO";

export interface ICompleteSignupUsecase {
  execute(data: AuthRequestDTO): Promise<void>;
}
