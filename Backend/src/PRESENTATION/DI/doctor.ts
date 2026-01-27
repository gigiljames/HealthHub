import { DoctorProfileRepository } from "../../infrastructure/repositories/doctorProfileRespository";
import { AuthRepository } from "../../infrastructure/repositories/authRepository";
import { DoctorController } from "../controllers/doctor/doctorController";
import { DProfileBasicInfoUsecase } from "../../application/usecases/doctor/doctorProfile/dProfileBasicInfoUsecase";
import { DProfileEducationUsecase } from "../../application/usecases/doctor/doctorProfile/dProfileEducationUsecase";
import { DProfileExperienceUsecase } from "../../application/usecases/doctor/doctorProfile/dProfileExperienceUsecase";
import { GetAllDoctorsUsecase } from "../../application/usecases/doctor/doctorManagement/getAllDoctorsUsecase";
import { BlockDoctorUsecase } from "../../application/usecases/doctor/doctorManagement/blockDoctorUsecase";
import { UnblockDoctorUsecase } from "../../application/usecases/doctor/doctorManagement/unblockDoctorUsecase";
import { GetDoctorProfileUsecase } from "../../application/usecases/doctor/doctorManagement/getDoctorProfileUsecase";
import { VerifyDoctorUsecase } from "../../application/usecases/doctor/doctorManagement/verifyDoctorUsecase";
import { DGetProfileBasicInfoUsecase } from "../../application/usecases/doctor/doctorProfile/dGetProfileBasicInfoUsecase";
import { DGetProfileEducationUsecase } from "../../application/usecases/doctor/doctorProfile/dGetProfileEducationUsecase";
import { DGetProfileExperienceUsecase } from "../../application/usecases/doctor/doctorProfile/dGetProfileExperienceUsecase";
import { DOnboardingStep6Usecase } from "../../application/usecases/doctor/doctorOnboarding/dOnboardingStep6Usecase";
import { DSetupPractice } from "../../application/usecases/doctor/doctorOnboarding/dSetupPractice";
import { DOnboardingStep4Usecase } from "../../application/usecases/doctor/doctorOnboarding/dOnboardingStep4Usecase";
import { DGetOnboardingStep4Usecase } from "../../application/usecases/doctor/doctorOnboarding/dGetOnboardingStep4Usecase";
import { DGetMedicalLicenseUploadSignedUrlUseCase } from "../../application/usecases/doctor/doctorProfile/dGetMedicalLicenseUploadSignedUrlUsecase";
import { DGetDegreeCertificateUploadSignedUrlUseCase } from "../../application/usecases/doctor/doctorProfile/dGetDegreeCertificateUploadSignedUrlUsecase";
import { S3Service } from "../../application/services/s3Service";
import { DSaveVerificationDocsUsecase } from "../../application/usecases/doctor/doctorOnboarding/dSaveVerificationDocsUsecase";
import { DGetVerificationDocsUsecase } from "../../application/usecases/doctor/doctorOnboarding/dGetVerificationDocsUsecase";
import { DResubmitProfileUsecase } from "../../application/usecases/doctor/doctorProfile/dResubmitProfileUsecase";

// Services
const s3Service = new S3Service();

// Repositories
const doctorProfileRepository = new DoctorProfileRepository();
const authRepository = new AuthRepository();

// Usecases
const getAllDoctorsUsecase = new GetAllDoctorsUsecase(authRepository);
const blockDoctorUsecase = new BlockDoctorUsecase(authRepository);
const unblockDoctorUsecase = new UnblockDoctorUsecase(authRepository);
const getDoctorProfileUsecase = new GetDoctorProfileUsecase(
  authRepository,
  doctorProfileRepository,
  s3Service,
);
const verifyDoctorUsecase = new VerifyDoctorUsecase(doctorProfileRepository);
const dOnboardingStep6Usecase = new DOnboardingStep6Usecase(
  doctorProfileRepository,
  authRepository,
);
const dProfileBasicInfoUsecase = new DProfileBasicInfoUsecase(
  doctorProfileRepository,
  authRepository,
);
const dProfileEducationUsecase = new DProfileEducationUsecase(
  doctorProfileRepository,
);
const dProfileExperienceUsecase = new DProfileExperienceUsecase(
  doctorProfileRepository,
);
const dGetProfileBasicInfoUsecase = new DGetProfileBasicInfoUsecase(
  doctorProfileRepository,
  authRepository,
);
const dGetProfileEducationUsecase = new DGetProfileEducationUsecase(
  doctorProfileRepository,
);
const dGetProfileExperienceUsecase = new DGetProfileExperienceUsecase(
  doctorProfileRepository,
);
const dGetMedicalLicenseUploadSignedUrlUsecase =
  new DGetMedicalLicenseUploadSignedUrlUseCase(s3Service);
const dGetDegreeCertificateUploadSignedUrlUsecase =
  new DGetDegreeCertificateUploadSignedUrlUseCase(s3Service);
const dGetVerificationDocsUsecase = new DGetVerificationDocsUsecase(
  doctorProfileRepository,
  s3Service,
);
const dSaveVerificationDocsUsecase = new DSaveVerificationDocsUsecase(
  doctorProfileRepository,
);
const dSetupPractice = new DSetupPractice(doctorProfileRepository);
const dOnboardingStep4Usecase = new DOnboardingStep4Usecase(
  doctorProfileRepository,
);
const dGetOnboardingStep4Usecase = new DGetOnboardingStep4Usecase(
  doctorProfileRepository,
);
const dResubmitProfileUsecase = new DResubmitProfileUsecase(
  doctorProfileRepository,
);

// Controllers
export const injectedDoctorController = new DoctorController(
  getAllDoctorsUsecase,
  blockDoctorUsecase,
  unblockDoctorUsecase,
  getDoctorProfileUsecase,
  verifyDoctorUsecase,
  dProfileBasicInfoUsecase,
  dProfileEducationUsecase,
  dProfileExperienceUsecase,
  dGetProfileBasicInfoUsecase,
  dGetProfileEducationUsecase,
  dGetProfileExperienceUsecase,
  dGetMedicalLicenseUploadSignedUrlUsecase,
  dGetDegreeCertificateUploadSignedUrlUsecase,
  dGetVerificationDocsUsecase,
  dSaveVerificationDocsUsecase,
  dSetupPractice,
  dGetOnboardingStep4Usecase,
  dOnboardingStep4Usecase,
  dOnboardingStep6Usecase,
  dResubmitProfileUsecase,
);
