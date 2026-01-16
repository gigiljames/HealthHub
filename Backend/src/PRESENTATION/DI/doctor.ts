import { DoctorProfileRepository } from "../../infrastructure/repositories/doctorProfileRespository";
import { AuthRepository } from "../../infrastructure/repositories/authRepository";
import { DoctorController } from "../controllers/doctor/doctorController";
import { DProfileBasicInfoUsecase } from "../../application/usecases/doctor/doctorProfile/dProfileBasicInfoUsecase";
import { DProfileEducationUsecase } from "../../application/usecases/doctor/doctorProfile/dProfileEducationUsecase";
import { DProfileExperienceUsecase } from "../../application/usecases/doctor/doctorProfile/dProfileExperienceUsecase";
import { GetDoctorsUsecase } from "../../application/usecases/doctor/doctorManagement/getDoctorsUsecase";
import { BlockDoctorUsecase } from "../../application/usecases/doctor/doctorManagement/blockDoctorUsecase";
import { UnblockDoctorUsecase } from "../../application/usecases/doctor/doctorManagement/unblockDoctorUsecase";
import { GetDoctorProfileUsecase } from "../../application/usecases/doctor/doctorManagement/getDoctorProfileUsecase";
import { VerifyDoctorUsecase } from "../../application/usecases/doctor/doctorManagement/verifyDoctorUsecase";
import { DGetProfileBasicInfoUsecase } from "../../application/usecases/doctor/doctorProfile/dGetProfileBasicInfoUsecase";
import { DGetProfileEducationUsecase } from "../../application/usecases/doctor/doctorProfile/dGetProfileEducationUsecase";
import { DGetProfileExperienceUsecase } from "../../application/usecases/doctor/doctorProfile/dGetProfileExperienceUsecase";
import { DProfileCreation5Usecase } from "../../application/usecases/doctor/doctorProfile/dProfileCreation5Usecase";

// Repositories
const doctorProfileRepository = new DoctorProfileRepository();
const authRepository = new AuthRepository();

// Usecases
const getDoctorsUsecase = new GetDoctorsUsecase(authRepository);
const blockDoctorUsecase = new BlockDoctorUsecase(authRepository);
const unblockDoctorUsecase = new UnblockDoctorUsecase(authRepository);
const getDoctorProfileUsecase = new GetDoctorProfileUsecase(
  authRepository,
  doctorProfileRepository
);
const verifyDoctorUsecase = new VerifyDoctorUsecase(doctorProfileRepository);
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
  getDoctorsUsecase,
  blockDoctorUsecase,
  unblockDoctorUsecase,
  getDoctorProfileUsecase,
  verifyDoctorUsecase,
  dProfileCreation5Usecase,
  dProfileBasicInfoUsecase,
  dProfileEducationUsecase,
  dProfileExperienceUsecase,
  dGetProfileBasicInfoUsecase,
  dGetProfileEducationUsecase,
  dGetProfileExperienceUsecase
);
