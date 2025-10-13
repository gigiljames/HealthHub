import Auth from "../../../DOMAIN/entities/auth";
import { CustomError } from "../../../DOMAIN/entities/customError";
import { HttpStatusCodes } from "../../../DOMAIN/enums/httpStatusCodes";
import { IAuthRepository } from "../../../DOMAIN/interfaces/repositories/IAuthRepository";
import { IGoogleAuthUsecase } from "../../../DOMAIN/interfaces/usecases/auth/IGoogleAuthUsecase";
import { verifyGoogleIdToken } from "../../../PRESENTATION/google/googleVerification";
import { AuthResponseDTO } from "../../DTOs/auth/authDTO";
import { GoogleAuthRequestDTO } from "../../DTOs/auth/googleAuthDTO";
import { AuthMapper } from "../../mappers/authMapper";

export class GoogleAuthUsecase implements IGoogleAuthUsecase {
  constructor(private _authRepository: IAuthRepository) {}

  async execute(data: GoogleAuthRequestDTO): Promise<AuthResponseDTO> {
    const payload = await verifyGoogleIdToken(data.token);
    const email = payload.email;
    let user = await this._authRepository.findByEmail(email);
    if (user) {
      if (!user.googleId) {
        throw new CustomError(
          HttpStatusCodes.CONFLICT,
          "An account with same email already exists. Try to log in with it's password."
        );
      }
      if (user.role !== data.role) {
        throw new CustomError(
          HttpStatusCodes.FORBIDDEN,
          `Access denied: This account is not registered as a ${data.role}`
        );
      }
    }
    if (!user) {
      user = new Auth({
        name: payload.name,
        email,
        googleId: payload.sub,
        role: data.role,
        isBlocked: false,
        isNewUser: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await this._authRepository.save(user);
    }
    return AuthMapper.toAuthResponseDTOFromEntity(user);
  }
}
