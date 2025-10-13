import {
  AuthRequestDTO,
  AuthResponseDTO,
} from "../../../../APPLICATION/DTOs/auth/authDTO";

export interface ILoginUsecase {
  execute(data: AuthRequestDTO): Promise<AuthResponseDTO>;
}
