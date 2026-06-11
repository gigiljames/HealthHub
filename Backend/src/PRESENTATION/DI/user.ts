// import { CachingService } from "../../APPLICATION/services/cachingService";
// import { EmailService } from "../../APPLICATION/services/emailService";
// import { HashService } from "../../APPLICATION/services/hashService";
// import { OtpService } from "../../APPLICATION/services/otpService";
import { GetUsersUsecase } from "../../application/usecases/user/userManagement/getUsersUsecase";
import { GetUserProfileUsecase } from "../../application/usecases/user/userManagement/getUserProfileUsecase";
import { BlockUserUsecase } from "../../application/usecases/user/userManagement/blockUserUsecase";
import { UnblockUserUsecase } from "../../application/usecases/user/userManagement/unblockUserUsecase";
import { UProfileCreation1Usecase } from "../../application/usecases/user/userProfile/uProfileCreation1Usecase";
import { UProfileCreation2Usecase } from "../../application/usecases/user/userProfile/uProfileCreation2Usecase";
import { UProfileCreation3Usecase } from "../../application/usecases/user/userProfile/uProfileCreation3Usecase";
import { UProfileCreation4Usecase } from "../../application/usecases/user/userProfile/uProfileCreation4Usecase";
import { UserController } from "../controllers/user/userController";
import { AuthRepository } from "../../infrastructure/repositories/authRepository";
import { UserProfileRepository } from "../../infrastructure/repositories/userProfileRepository";
import { UGetProfileStage1Usecase } from "../../application/usecases/user/userProfile/uGetProfileStage1Usecase";
import { UGetProfileStage2Usecase } from "../../application/usecases/user/userProfile/uGetProfileStage2Usecase";
import { UGetProfileStage3Usecase } from "../../application/usecases/user/userProfile/uGetProfileStage3Usecase";
import { UGetProfileStage4Usecase } from "../../application/usecases/user/userProfile/uGetProfileStage4Usecase";
import { UserAnalyticsRepository } from "../../infrastructure/repositories/UserAnalyticsRepository";
import { GetUserAnalyticsUseCase } from "../../application/usecases/user/userManagement/GetUserAnalyticsUseCase";

// Services

//Repositores
const userProfileRepository = new UserProfileRepository();
const authRepository = new AuthRepository();

// Usecases
const getUsersUsecase = new GetUsersUsecase(authRepository);
const getUserProfileUsecase = new GetUserProfileUsecase(
  authRepository,
  userProfileRepository
);
const blockUserUsecase = new BlockUserUsecase(authRepository);
const unblockUserUsecase = new UnblockUserUsecase(authRepository);
const uProfileCreation1Usecase = new UProfileCreation1Usecase(
  userProfileRepository,
  authRepository
);
const uProfileCreation2Usecase = new UProfileCreation2Usecase(
  userProfileRepository
);
const uProfileCreation3Usecase = new UProfileCreation3Usecase(
  userProfileRepository
);
const uProfileCreation4Usecase = new UProfileCreation4Usecase(
  userProfileRepository,
  authRepository
);
const uGetProfileStage1Usecase = new UGetProfileStage1Usecase(
  userProfileRepository,
  authRepository
);
const uGetProfileStage2Usecase = new UGetProfileStage2Usecase(
  userProfileRepository
);
const uGetProfileStage3Usecase = new UGetProfileStage3Usecase(
  userProfileRepository
);
const uGetProfileStage4Usecase = new UGetProfileStage4Usecase(
  userProfileRepository
);

const userAnalyticsRepository = new UserAnalyticsRepository();
const getUserAnalyticsUseCase = new GetUserAnalyticsUseCase(
  userAnalyticsRepository
);

// Controllers
export const injectedUserController = new UserController(
  getUsersUsecase,
  getUserProfileUsecase,
  blockUserUsecase,
  unblockUserUsecase,
  uProfileCreation1Usecase,
  uProfileCreation2Usecase,
  uProfileCreation3Usecase,
  uProfileCreation4Usecase,
  uGetProfileStage1Usecase,
  uGetProfileStage2Usecase,
  uGetProfileStage3Usecase,
  uGetProfileStage4Usecase,
  getUserAnalyticsUseCase
);
