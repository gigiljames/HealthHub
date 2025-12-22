import { DGetSpecializationListUsecase } from "../../application/usecases/doctor/dGetSpecializationListUsecase";

import { SpecializationRepository } from "../../infrastructure/repositories/specializationRepository";
import { DoctorProfileRepository } from "../../infrastructure/repositories/doctorProfileRespository";
import { AuthRepository } from "../../infrastructure/repositories/authRepository";
import { DoctorController } from "../controllers/doctor/doctorController";

import { DProfileBasicInfoUsecase } from "../../application/usecases/doctor/dProfileBasicInfoUsecase";
import { DProfileEducationUsecase } from "../../application/usecases/doctor/dProfileEducationUsecase";
import { DProfileExperienceUsecase } from "../../application/usecases/doctor/dProfileExperienceUsecase";

import { DGetProfileBasicInfoUsecase } from "../../application/usecases/doctor/dGetProfileBasicInfoUsecase";
import { DGetProfileEducationUsecase } from "../../application/usecases/doctor/dGetProfileEducationUsecase";
import { DGetProfileExperienceUsecase } from "../../application/usecases/doctor/dGetProfileExperienceUsecase";
import { DProfileCreation5Usecase } from "../../application/usecases/doctor/dProfileCreation5Usecase";

// Repositories
const specializationRepository = new SpecializationRepository();
const doctorProfileRepository = new DoctorProfileRepository();
const authRepository = new AuthRepository();

// Services

// Usecases
const dGetSpecializationListUsecase = new DGetSpecializationListUsecase(
  specializationRepository
);
const dProfileCreation5Usecase = new DProfileCreation5Usecase(
  doctorProfileRepository,
  authRepository
);
const dProfileBasicInfoUsecase = new DProfileBasicInfoUsecase(
  doctorProfileRepository,
  authRepository
);
const dProfileEducationUsecase = new DProfileEducationUsecase(
  doctorProfileRepository
);
const dProfileExperienceUsecase = new DProfileExperienceUsecase(
  doctorProfileRepository
);
const dGetProfileBasicInfoUsecase = new DGetProfileBasicInfoUsecase(
  doctorProfileRepository,
  authRepository
);
const dGetProfileEducationUsecase = new DGetProfileEducationUsecase(
  doctorProfileRepository
);
const dGetProfileExperienceUsecase = new DGetProfileExperienceUsecase(
  doctorProfileRepository
);

// Controllers

export const injectedDoctorController = new DoctorController(
  dGetSpecializationListUsecase,
  dProfileCreation5Usecase,
  dProfileBasicInfoUsecase,
  dProfileEducationUsecase,
  dProfileExperienceUsecase,
  dGetProfileBasicInfoUsecase,
  dGetProfileEducationUsecase,
  dGetProfileExperienceUsecase
);
