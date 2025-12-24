// Services

import { S3Service } from "../../application/services/s3Service";
import { HGetProfileStage1Usecase } from "../../application/usecases/hospital/profileCreation/hGetProfileStage1Usecase";
import { HGetProfileStage2Usecase } from "../../application/usecases/hospital/profileCreation/hGetProfileStage2Usecase";
import { HGetProfileStage3Usecase } from "../../application/usecases/hospital/profileCreation/hGetProfileStage3Usecase";
import { HGetProfileStage4Usecase } from "../../application/usecases/hospital/profileCreation/hGetProfileStage4Usecase";
import { HGetProfileStage5Usecase } from "../../application/usecases/hospital/profileCreation/hGetProfileStage5Usecase";
import { HProfileCreation1Usecase } from "../../application/usecases/hospital/profileCreation/hProfileCreation1Usecase";
import { HProfileCreation2Usecase } from "../../application/usecases/hospital/profileCreation/hProfileCreation2Usecase";
import { HProfileCreation3Usecase } from "../../application/usecases/hospital/profileCreation/hProfileCreation3Usecase";
import { HProfileCreation4Usecase } from "../../application/usecases/hospital/profileCreation/hProfileCreation4Usecase";
import { HProfileCreation5Usecase } from "../../application/usecases/hospital/profileCreation/hProfileCreation5Usecase";
import { AuthRepository } from "../../infrastructure/repositories/authRepository";
import { HospitalProfileRepository } from "../../infrastructure/repositories/hospitalProfileRepository";
import { HospitalController } from "../controllers/hospital/hospitalController";

// Services
const s3Service = new S3Service();

// Repositories
const hospitalProfileRepository = new HospitalProfileRepository();
const authRepository = new AuthRepository();

// Usecases
const hGetProfileStage1Usecase = new HGetProfileStage1Usecase(
  hospitalProfileRepository,
  authRepository
);
const hGetProfileStage2Usecase = new HGetProfileStage2Usecase(
  hospitalProfileRepository
);
const hGetProfileStage3Usecase = new HGetProfileStage3Usecase(
  hospitalProfileRepository,
  s3Service
);
const hGetProfileStage4Usecase = new HGetProfileStage4Usecase(
  hospitalProfileRepository
);
const hGetProfileStage5Usecase = new HGetProfileStage5Usecase(
  hospitalProfileRepository
);
const hProfileCreation1Usecase = new HProfileCreation1Usecase(
  hospitalProfileRepository,
  authRepository
);
const hProfileCreation2Usecase = new HProfileCreation2Usecase(
  hospitalProfileRepository
);
const hProfileCreation3Usecase = new HProfileCreation3Usecase(
  hospitalProfileRepository
);
const hProfileCreation4Usecase = new HProfileCreation4Usecase(
  hospitalProfileRepository
);
const hProfileCreation5Usecase = new HProfileCreation5Usecase(
  hospitalProfileRepository,
  authRepository
);

// Controllers
export const injectedHospitalController = new HospitalController(
  hProfileCreation1Usecase,
  hProfileCreation2Usecase,
  hProfileCreation3Usecase,
  hProfileCreation4Usecase,
  hProfileCreation5Usecase,
  hGetProfileStage1Usecase,
  hGetProfileStage2Usecase,
  hGetProfileStage3Usecase,
  hGetProfileStage4Usecase,
  hGetProfileStage5Usecase
);
