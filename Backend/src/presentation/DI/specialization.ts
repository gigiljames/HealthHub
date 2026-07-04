import { SpecializationController } from "../controllers/specialization/specializationController";
import { ActivateSpecializationUsecase } from "../../application/usecases/specialization/activateSpecializationUsecase";
import { AddSpecializationUsecase } from "../../application/usecases/specialization/addSpecializationUsecase";
import { DeactivateSpecializationUsecase } from "../../application/usecases/specialization/deactivateSpecializationUsecase";
import { EditSpecializationUsecase } from "../../application/usecases/specialization/editSpecializationUsecase";
import { GetSpecializationUsecase } from "../../application/usecases/specialization/getSpecializationUsecase";
import { SpecializationRepository } from "../../infrastructure/repositories/specializationRepository";

// Respositories
const specializationRepository = new SpecializationRepository();

// Usecases
const getSpecializationUsecase = new GetSpecializationUsecase(
  specializationRepository,
);
const addSpecializationUsecase = new AddSpecializationUsecase(
  specializationRepository,
);
const activateSpecializaitonUsecase = new ActivateSpecializationUsecase(
  specializationRepository,
);
const deactivateSpecializationUsecase = new DeactivateSpecializationUsecase(
  specializationRepository,
);
const editSpecializationUsecase = new EditSpecializationUsecase(
  specializationRepository,
);

// Controllers
export const injectedSpecializationController = new SpecializationController(
  addSpecializationUsecase,
  activateSpecializaitonUsecase,
  deactivateSpecializationUsecase,
  editSpecializationUsecase,
  getSpecializationUsecase,
);
