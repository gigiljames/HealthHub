import { AuthRequestDTO } from "../../../../APPLICATION/DTOs/auth/authDTO";

export interface IResendOtpUsecase {
  execute(data: AuthRequestDTO): Promise<void>;
}
