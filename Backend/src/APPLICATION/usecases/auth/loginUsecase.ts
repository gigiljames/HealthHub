import { AuthRequestDTO, AuthResponseDTO } from "../../DTOs/auth/authDTO";
import { IAuthRepository } from "../../../domain/interfaces/repositories/IAuthRepository";
import { IHashService } from "../../../domain/interfaces/services/IHashService";
import { ILoginUsecase } from "../../../domain/interfaces/usecases/auth/ILoginUsecase";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";
import { AuthMapper } from "../../mappers/authMapper";

export class LoginUsecase implements ILoginUsecase {
  constructor(
    private _authRepository: IAuthRepository,
    private _hashService: IHashService
  ) {}

  async execute(data: AuthRequestDTO): Promise<AuthResponseDTO> {
    const { email, role, password } = data;
    const user = await this._authRepository.findByEmail(email);
    if (!user?.passwordHash) {
      throw new CustomError(
        HttpStatusCodes.UNAUTHORIZED,
        MESSAGES.INCORRECT_AUTH_CREDENTIALS
      );
    }
    if (user && !user.isBlocked && user.role === role) {
      const verified = await this._hashService.compare(
        password!,
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
