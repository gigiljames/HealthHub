import { MESSAGES } from "../../../domain/constants/messages";
import Auth from "../../../domain/entities/auth";
import { CustomError } from "../../../domain/entities/customError";
import DoctorProfile from "../../../domain/entities/doctorProfile";
import UserProfile from "../../../domain/entities/userProfile";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { Roles } from "../../../domain/enums/roles";
import { IAuthRepository } from "../../../domain/interfaces/repositories/IAuthRepository";
import { IGoogleAuthUsecase } from "../../../domain/interfaces/usecases/auth/IGoogleAuthUsecase";
import { verifyGoogleIdToken } from "../../../presentation/google/googleVerification";
import { AuthResponseDTO } from "../../DTOs/auth/authDTO";
import { GoogleAuthRequestDTO } from "../../DTOs/auth/googleAuthDTO";
import { AuthMapper } from "../../mappers/authMapper";
import { IUserProfileRepository } from "../../../domain/interfaces/repositories/IUserProfileRepository";
import { IDoctorProfileRepository } from "../../../domain/interfaces/repositories/IDoctorProfileRepository";
import { IWalletRepository } from "../../../domain/interfaces/repositories/IWalletRepository";

export class GoogleAuthUsecase implements IGoogleAuthUsecase {
  constructor(
    private readonly _authRepository: IAuthRepository,
    private readonly _userProfileRepository: IUserProfileRepository,
    private readonly _doctorProfileRepository: IDoctorProfileRepository,
    private readonly _walletRepository: IWalletRepository,
  ) {}

  async execute(data: GoogleAuthRequestDTO): Promise<AuthResponseDTO> {
    const payload = await verifyGoogleIdToken(data.token);
    const email = payload?.email;
    if (email) {
      let user = await this._authRepository.findByEmail(email);
      if (user) {
        if (!user.googleId) {
          throw new CustomError(
            HttpStatusCodes.CONFLICT,
            MESSAGES.ACCOUNT_ALREADY_EXISTS,
          );
        }
        if (user.role !== data.role) {
          throw new CustomError(
            HttpStatusCodes.FORBIDDEN,
            `Access denied: This account is not registered as a ${data.role}`,
          );
        }
      }
      if (!user) {
        if (data.role === Roles.USER) {
          const authUser = new Auth({
            name: payload?.name ?? "",
            email,
            googleId: payload.sub,
            profileModel: "UserProfile",
            role: data.role,
            isBlocked: false,
            isNewUser: true,
            onboardingStep: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          user = await this._authRepository.save(authUser);
          const userProfile = new UserProfile({
            userId: user.id!,
          });
          const userProfileDoc =
            await this._userProfileRepository.save(userProfile);
          user.profileId = userProfileDoc.id!;
          user = await this._authRepository.save(user);
          await this._walletRepository.createWallet(user.id!);
        } else if (data.role === Roles.DOCTOR) {
          const authUser = new Auth({
            name: payload?.name ?? "",
            email,
            googleId: payload.sub,
            profileModel: "DoctorProfile",
            role: data.role,
            isBlocked: false,
            isNewUser: true,
            onboardingStep: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          user = await this._authRepository.save(authUser);
          const doctorProfile = new DoctorProfile({
            doctorId: user.id!,
          });
          const doctorProfileDoc =
            await this._doctorProfileRepository.save(doctorProfile);
          user.profileId = doctorProfileDoc.id!;
          user = await this._authRepository.save(user);
          await this._walletRepository.createWallet(user.id!);
        }
      }
      return AuthMapper.toAuthResponseDTOFromEntity(user!);
    } else {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.EMAIL_NOT_FOUND,
      );
    }
  }
}
