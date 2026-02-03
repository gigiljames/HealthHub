import { CompleteSignupRequestDTO } from "../../DTOs/auth/completeSignupDTO";
import Auth from "../../../domain/entities/auth";
import { IAuthRepository } from "../../../domain/interfaces/repositories/IAuthRepository";
import { IHashService } from "../../../domain/interfaces/services/IHashService";
import { IOtpService } from "../../../domain/interfaces/services/IOtpService";
import { ICompleteSignupUsecase } from "../../../domain/interfaces/usecases/auth/ICompleteSignupUsecase";
import { Roles } from "../../../domain/enums/roles";
import { MESSAGES } from "../../../domain/constants/messages";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { IUserProfileRepository } from "../../../domain/interfaces/repositories/IUserProfileRepository";
import { IDoctorProfileRepository } from "../../../domain/interfaces/repositories/IDoctorProfileRepository";
import UserProfile from "../../../domain/entities/userProfile";
import DoctorProfile from "../../../domain/entities/doctorProfile";

export class CompleteSignupUsecase implements ICompleteSignupUsecase {
  constructor(
    private _authRepository: IAuthRepository,
    private _otpService: IOtpService,
    private _hashService: IHashService,
    private _userProfileRepository: IUserProfileRepository,
    private _doctorProfileRepository: IDoctorProfileRepository,
  ) {}
  async execute(data: CompleteSignupRequestDTO): Promise<void> {
    if (data.role === Roles.ADMIN) {
      throw new CustomError(HttpStatusCodes.FORBIDDEN, MESSAGES.INVALID_ROLE);
    }
    if (this._otpService.verifyOtp(data.otp, data.email)) {
      const passwordHash = await this._hashService.hash(data.password);

      if (data.role === Roles.USER) {
        const authUser = new Auth({
          name: data.name,
          email: data.email,
          passwordHash,
          profileModel: "UserProfile",
          role: data.role,
          isBlocked: false,
          isNewUser: true,
          onboardingStep: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        const user = await this._authRepository.save(authUser);
        const userProfile = new UserProfile({
          userId: user.id!,
        });
        const userProfileDoc =
          await this._userProfileRepository.save(userProfile);
        user.profileId = userProfileDoc.id!;
        await this._authRepository.save(user);
      } else if (data.role === Roles.DOCTOR) {
        const authUser = new Auth({
          name: data.name,
          email: data.email,
          passwordHash,
          profileModel: "DoctorProfile",
          role: data.role,
          isBlocked: false,
          isNewUser: true,
          onboardingStep: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        const user = await this._authRepository.save(authUser);
        const doctorProfile = new DoctorProfile({
          doctorId: user.id!,
        });
        const doctorProfileDoc =
          await this._doctorProfileRepository.save(doctorProfile);
        user.profileId = doctorProfileDoc.id!;
        await this._authRepository.save(user);
      }
    } else {
      throw new CustomError(HttpStatusCodes.UNAUTHORIZED, MESSAGES.INVALID_OTP);
    }
  }
}
