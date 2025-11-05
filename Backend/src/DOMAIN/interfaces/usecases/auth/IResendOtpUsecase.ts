import { AuthRequestDTO } from "../../../../application/DTOs/auth/authDTO";

export interface IResendOtpUsecase {
  execute(data: AuthRequestDTO): Promise<void>;
}
