import { CachingService } from "../../2APPLICATION/services/cachingService";
import { EmailService } from "../../2APPLICATION/services/emailService";
import { OtpService } from "../../2APPLICATION/services/otpService";
import { SendOtpUsecase } from "../../2APPLICATION/usecases/user/auth/sendOtpUsecase";
import { UserAuthController } from "../../3INFRASTRUCTURE/controllers/user/userAuthController";

// Services
const cachingService = new CachingService();
const emailService = new EmailService();
const otpService = new OtpService(cachingService);

// Usecases
const sendOtpUsecase = new SendOtpUsecase(otpService, emailService);

// Controllers
export const injectedUserAuthController = new UserAuthController(
  sendOtpUsecase
);
