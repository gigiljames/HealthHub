import { AuthRequestDTO, AuthResponseDTO } from "../../DTOs/auth/authDTO";
import { IAuthRepository } from "../../../DOMAIN/interfaces/repositories/IAuthRepository";
import { IHashService } from "../../../DOMAIN/interfaces/services/IHashService";
import { ILoginUsecase } from "../../../DOMAIN/interfaces/usecases/auth/ILoginUsecase";
import { CustomError } from "../../../DOMAIN/entities/customError";
import { HttpStatusCodes } from "../../../DOMAIN/enums/httpStatusCodes";
import { MESSAGES } from "../../../DOMAIN/constants/messages";
import { AuthMapper } from "../../mappers/authMapper";

export class LoginUsecase implements ILoginUsecase {
  constructor(
    private _authRepository: IAuthRepository,
    private _hashService: IHashService
  ) {}

  async execute(data: AuthRequestDTO): Promise<AuthResponseDTO> {
    const { email, role, password } = data;
    const user = await this._authRepository.findByEmail(email);
    if (!user.passwordHash) {
      throw new CustomError(
        HttpStatusCodes.UNAUTHORIZED,
        MESSAGES.INCORRECT_AUTH_CREDENTIALS
      );
    }
    if (user && !user.isBlocked && user.role === role) {
      const verified = await this._hashService.compare(
        password,
        user.passwordHash
      );

      if (verified) {
        return AuthMapper.toAuthResponseDTOFromEntity(user);
      } else {
        throw new CustomError(
          HttpStatusCodes.UNAUTHORIZED,
          MESSAGES.INCORRECT_AUTH_CREDENTIALS
        );
      }
    } else {
      throw new CustomError(
        HttpStatusCodes.UNAUTHORIZED,
        MESSAGES.INCORRECT_AUTH_CREDENTIALS
      );
    }
  }
}
