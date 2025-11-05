import {
  AuthRequestDTO,
  AuthResponseDTO,
} from "../../../../application/DTOs/auth/authDTO";

export interface ILoginUsecase {
  execute(data: AuthRequestDTO): Promise<AuthResponseDTO>;
}
