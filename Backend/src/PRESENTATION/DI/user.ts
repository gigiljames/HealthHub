// import { CachingService } from "../../APPLICATION/services/cachingService";
// import { EmailService } from "../../APPLICATION/services/emailService";
// import { HashService } from "../../APPLICATION/services/hashService";
// import { OtpService } from "../../APPLICATION/services/otpService";
import { UProfileCreation1Usecase } from "../../application/usecases/user/profileCreation/uProfileCreation1Usecase";
import { UProfileCreation2Usecase } from "../../application/usecases/user/profileCreation/uProfileCreation2Usecase";
import { UProfileCreation3Usecase } from "../../application/usecases/user/profileCreation/uProfileCreation3Usecase";
import { UProfileCreation4Usecase } from "../../application/usecases/user/profileCreation/uProfileCreation4Usecase";
import { UserController } from "../controllers/user/userController";
import { AuthRepository } from "../../infrastructure/repositories/authRepository";
import { UserProfileRepository } from "../../infrastructure/repositories/userProfileRepository";
import { UGetProfileStage1Usecase } from "../../application/usecases/user/profileCreation/uGetProfileStage1Usecase";
import { UGetProfileStage2Usecase } from "../../application/usecases/user/profileCreation/uGetProfileStage2Usecase";
import { UGetProfileStage3Usecase } from "../../application/usecases/user/profileCreation/uGetProfileStage3Usecase";
import { UGetProfileStage4Usecase } from "../../application/usecases/user/profileCreation/uGetProfileStage4Usecase";

// Services
// const cachingService = new CachingService();
// const emailService = new EmailService();
// const otpService = new OtpService(cachingService);
// const hashService = new HashService();

//Repositores
const userProfileRespository = new UserProfileRepository();
const authRepository = new AuthRepository();

// Usecases
const uProfileCreation1Usecase = new UProfileCreation1Usecase(
  userProfileRespository
);
const uProfileCreation2Usecase = new UProfileCreation2Usecase(
  userProfileRespository
);
const uProfileCreation3Usecase = new UProfileCreation3Usecase(
  userProfileRespository
);
const uProfileCreation4Usecase = new UProfileCreation4Usecase(
  userProfileRespository,
  authRepository
);
const uGetProfileStage1Usecase = new UGetProfileStage1Usecase(
  userProfileRespository
);
const uGetProfileStage2Usecase = new UGetProfileStage2Usecase(
  userProfileRespository
);
const uGetProfileStage3Usecase = new UGetProfileStage3Usecase(
  userProfileRespository
);
const uGetProfileStage4Usecase = new UGetProfileStage4Usecase(
  userProfileRespository
);

// Controllers
export const injectedUserController = new UserController(
  uProfileCreation1Usecase,
  uProfileCreation2Usecase,
  uProfileCreation3Usecase,
  uProfileCreation4Usecase,
  uGetProfileStage1Usecase,
  uGetProfileStage2Usecase,
  uGetProfileStage3Usecase,
  uGetProfileStage4Usecase
);
