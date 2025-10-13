import { AuthResponseDTO } from "../../../../APPLICATION/DTOs/auth/authDTO";
import { GoogleAuthRequestDTO } from "../../../../APPLICATION/DTOs/auth/googleAuthDTO";

export interface IGoogleAuthUsecase {
  execute(data: GoogleAuthRequestDTO): Promise<AuthResponseDTO>;
}
