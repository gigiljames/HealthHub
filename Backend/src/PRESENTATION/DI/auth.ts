import { CachingService } from "../../APPLICATION/services/cachingService";
import { EmailService } from "../../APPLICATION/services/emailService";
import { HashService } from "../../APPLICATION/services/hashService";
import { OtpService } from "../../APPLICATION/services/otpService";
import TokenService from "../../APPLICATION/services/tokenService";
import { CompleteSignupUsecase } from "../../APPLICATION/usecases/auth/completeSignupUsecase";
import { ForgotPasswordUsecase } from "../../APPLICATION/usecases/auth/forgotPasswordUsecase";
import { ForgotPasswordVerifyOtpUsecase } from "../../APPLICATION/usecases/auth/forgotPasswordVerifyOtpUsecase";
import { GoogleAuthUsecase } from "../../APPLICATION/usecases/auth/googleAuthUsecase";
import { LoginUsecase } from "../../APPLICATION/usecases/auth/loginUsecase";
import { ResendOtpUsecase } from "../../APPLICATION/usecases/auth/resendOtpUsecase";
import { ResetPasswordUsecase } from "../../APPLICATION/usecases/auth/resetPasswordUsecase";
import { SignupUsecase } from "../../APPLICATION/usecases/auth/signupUsecase";
import { AuthController } from "../controllers/authentication/authController";
import { AuthRepository } from "../../INFRASTRUCTURE/repositories/authRepository";

// Services
const cachingService = new CachingService();
const emailService = new EmailService();
const otpService = new OtpService(cachingService);
const hashService = new HashService();
const tokenService = new TokenService();

// Repositories
const authRepository = new AuthRepository();

// Usecases
const signupUsecase = new SignupUsecase(
  otpService,
  emailService,
  authRepository
);
const completeSingupUsecase = new CompleteSignupUsecase(
  authRepository,
  otpService,
  hashService
);
const loginUsercase = new LoginUsecase(authRepository, hashService);
const resendOtpUsecase = new ResendOtpUsecase(
  otpService,
  emailService,
  authRepository
);
const forgotPasswordUsecase = new ForgotPasswordUsecase(
  emailService,
  otpService,
  authRepository
);
const forgotPasswordVerifyOtpUsecase = new ForgotPasswordVerifyOtpUsecase(
  otpService,
  cachingService
);
const resetPasswordUsecase = new ResetPasswordUsecase(
  cachingService,
  hashService,
  authRepository
);
const googleAuthUsecase = new GoogleAuthUsecase(authRepository);

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
  googleAuthUsecase
);
