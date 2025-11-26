import { ActivateSpecializationUsecase } from "../../application/usecases/admin/specializationManagement/activateSpecializationUsecase";
import { AddSpecializationUsecase } from "../../application/usecases/admin/specializationManagement/addSpecializationUsecase";
import { DeactivateSpecializationUsecase } from "../../application/usecases/admin/specializationManagement/deactivateSpecializationUsecase";
import { EditSpecializationUsecase } from "../../application/usecases/admin/specializationManagement/editSpecializationUsecase";
import { GetSpecializationUsecase } from "../../application/usecases/admin/specializationManagement/getSpecializationUsecase";
import { GetUsersUsecase } from "../../application/usecases/admin/userManagement/getUsersUsecase";
import { GetUserProfileUsecase } from "../../application/usecases/admin/userManagement/getUserProfileUsecase";
import { BlockUserUsecase } from "../../application/usecases/admin/userManagement/blockUserUsecase";
import { UnblockUserUsecase } from "../../application/usecases/admin/userManagement/unblockUserUsecase";
import { AdminController } from "../controllers/admin/adminController";
import { SpecializationRepository } from "../../infrastructure/repositories/specializationRepository";
import { AuthRepository } from "../../infrastructure/repositories/authRepository";
import { UserProfileRepository } from "../../infrastructure/repositories/userProfileRepository";
import { GetDoctorsUsecase } from "../../application/usecases/admin/doctorManagement/getDoctorsUsecase";

// Services

// Repositories
const specializationRepository = new SpecializationRepository();
const authRepository = new AuthRepository();
const userProfileRepository = new UserProfileRepository();

// Usecases
const getSpecializationUsecase = new GetSpecializationUsecase(
  specializationRepository
);
const addSpecializationUsecase = new AddSpecializationUsecase(
  specializationRepository
);
const activateSpecializaitonUsecase = new ActivateSpecializationUsecase(
  specializationRepository
);
const deactivateSpecializationUsecase = new DeactivateSpecializationUsecase(
  specializationRepository
);
const editSpecializationUsecase = new EditSpecializationUsecase(
  specializationRepository
);
const getUsersUsecase = new GetUsersUsecase(authRepository);
const getUserProfileUsecase = new GetUserProfileUsecase(
  authRepository,
  userProfileRepository
);
const blockUserUsecase = new BlockUserUsecase(authRepository);
const unblockUserUsecase = new UnblockUserUsecase(authRepository);
const getDoctorsUsecase = new GetDoctorsUsecase(authRepository);

// Controllers
export const injectedAdminController = new AdminController(
  addSpecializationUsecase,
  activateSpecializaitonUsecase,
  deactivateSpecializationUsecase,
  editSpecializationUsecase,
  getSpecializationUsecase,
  getUsersUsecase,
  getUserProfileUsecase,
  blockUserUsecase,
  unblockUserUsecase,
  getDoctorsUsecase
);
