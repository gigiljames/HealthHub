import { CachingService } from "../../application/services/cachingService";
import { EmailService } from "../../application/services/emailService";
import { HashService } from "../../application/services/hashService";
import { OtpService } from "../../application/services/otpService";
import TokenService from "../../application/services/tokenService";
import { CompleteSignupUsecase } from "../../application/usecases/auth/completeSignupUsecase";
import { ForgotPasswordUsecase } from "../../application/usecases/auth/forgotPasswordUsecase";
import { ForgotPasswordVerifyOtpUsecase } from "../../application/usecases/auth/forgotPasswordVerifyOtpUsecase";
import { GoogleAuthUsecase } from "../../application/usecases/auth/googleAuthUsecase";
import { LoginUsecase } from "../../application/usecases/auth/loginUsecase";
import { ResendOtpUsecase } from "../../application/usecases/auth/resendOtpUsecase";
import { ResetPasswordUsecase } from "../../application/usecases/auth/resetPasswordUsecase";
import { SignupUsecase } from "../../application/usecases/auth/signupUsecase";
import { ChangePasswordUsecase } from "../../application/usecases/auth/changePasswordUsecase";
import { AuthController } from "../controllers/auth/authController";
import { AuthRepository } from "../../infrastructure/repositories/authRepository";
import { UserProfileRepository } from "../../infrastructure/repositories/userProfileRepository";
import { DoctorProfileRepository } from "../../infrastructure/repositories/doctorProfileRepository";
import { WalletRepository } from "../../infrastructure/repositories/walletRepository";

// Services
const cachingService = new CachingService();
const emailService = new EmailService();
const otpService = new OtpService(cachingService);
const hashService = new HashService();
const tokenService = new TokenService();

// Repositories
const authRepository = new AuthRepository();
const userProfileRepository = new UserProfileRepository();
const doctorProfileRepository = new DoctorProfileRepository();
const walletRepository = new WalletRepository();

// Usecases
const signupUsecase = new SignupUsecase(
  otpService,
  emailService,
  authRepository,
);
const completeSingupUsecase = new CompleteSignupUsecase(
  authRepository,
  otpService,
  hashService,
  userProfileRepository,
  doctorProfileRepository,
  walletRepository,
);
const loginUsercase = new LoginUsecase(authRepository, hashService);
const resendOtpUsecase = new ResendOtpUsecase(
  otpService,
  emailService,
  authRepository,
);
const forgotPasswordUsecase = new ForgotPasswordUsecase(
  emailService,
  otpService,
  authRepository,
);
const forgotPasswordVerifyOtpUsecase = new ForgotPasswordVerifyOtpUsecase(
  otpService,
  cachingService,
);
const resetPasswordUsecase = new ResetPasswordUsecase(
  cachingService,
  hashService,
  authRepository,
);
const googleAuthUsecase = new GoogleAuthUsecase(
  authRepository,
  userProfileRepository,
  doctorProfileRepository,
  walletRepository,
);

const changePasswordUsecase = new ChangePasswordUsecase(
  authRepository,
  hashService,
  emailService,
);

// Controller
export const injectedAuthController = new AuthController(
  signupUsecase,
  completeSingupUsecase,
  authRepository,
  loginUsercase,
  resendOtpUsecase,
  tokenService,
  forgotPasswordUsecase,
  forgotPasswordVerifyOtpUsecase,
  resetPasswordUsecase,
  googleAuthUsecase,
  changePasswordUsecase,
);
