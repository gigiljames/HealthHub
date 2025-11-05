import { ActivateSpecializationUsecase } from "../../application/usecases/admin/specializationManagement/activateSpecializationUsecase";
import { AddSpecializationUsecase } from "../../application/usecases/admin/specializationManagement/addSpecializationUsecase";
import { DeactivateSpecializationUsecase } from "../../application/usecases/admin/specializationManagement/deactivateSpecializationUsecase";
import { EditSpecializationUsecase } from "../../application/usecases/admin/specializationManagement/editSpecializationUsecase";
import { GetSpecializationUsecase } from "../../application/usecases/admin/specializationManagement/getSpecializationUsecase";
import { AdminController } from "../controllers/admin/adminController";
import { SpecializationRepository } from "../../infrastructure/repositories/specializationRepository";

// Services

// Repositories
const specializationRepository = new SpecializationRepository();

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

// Controllers
export const injectedAdminController = new AdminController(
  addSpecializationUsecase,
  activateSpecializaitonUsecase,
  deactivateSpecializationUsecase,
  editSpecializationUsecase,
  getSpecializationUsecase
);
