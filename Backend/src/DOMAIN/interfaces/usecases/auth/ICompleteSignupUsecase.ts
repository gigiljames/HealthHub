import { AuthRequestDTO } from "../../../../APPLICATION/DTOs/auth/authDTO";

export interface ICompleteSignupUsecase {
  execute(data: AuthRequestDTO): Promise<void>;
}
