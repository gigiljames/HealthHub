import { AuthResponseDTO } from "../../../../application/DTOs/auth/authDTO";
import { GoogleAuthRequestDTO } from "../../../../application/DTOs/auth/googleAuthDTO";

export interface IGoogleAuthUsecase {
  execute(data: GoogleAuthRequestDTO): Promise<AuthResponseDTO>;
}
