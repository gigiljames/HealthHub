import { MESSAGES } from "../../../domain/constants/messages";
import Auth from "../../../domain/entities/auth";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { IAuthRepository } from "../../../domain/interfaces/repositories/IAuthRepository";
import { IGoogleAuthUsecase } from "../../../domain/interfaces/usecases/auth/IGoogleAuthUsecase";
import { verifyGoogleIdToken } from "../../../presentation/google/googleVerification";
import { AuthResponseDTO } from "../../DTOs/auth/authDTO";
import { GoogleAuthRequestDTO } from "../../DTOs/auth/googleAuthDTO";
import { AuthMapper } from "../../mappers/authMapper";

export class GoogleAuthUsecase implements IGoogleAuthUsecase {
  constructor(private _authRepository: IAuthRepository) {}

  async execute(data: GoogleAuthRequestDTO): Promise<AuthResponseDTO> {
    const payload = await verifyGoogleIdToken(data.token);
    const email = payload?.email;
    if (email) {
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
          name: payload?.name ?? "",
          email,
          googleId: payload.sub,
          role: data.role,
          isBlocked: false,
          isNewUser: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        user = await this._authRepository.save(user);
      }
      return AuthMapper.toAuthResponseDTOFromEntity(user);
    } else {
      throw new CustomError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        MESSAGES.EMAIL_NOT_FOUND
      );
    }
  }
}
