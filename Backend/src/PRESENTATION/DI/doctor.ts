import { DoctorProfileRepository } from "../../infrastructure/repositories/doctorProfileRepository";
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
import { OrganizationRepository } from "../../infrastructure/repositories/organizationRepository";
import { DGetPracticeLocationsUsecase } from "../../application/usecases/doctor/doctorProfile/dGetPracticeLocationsUsecase";
import { DGetAllPracticeLocationsUsecase } from "../../application/usecases/doctor/doctorProfile/dGetAllPracticeLocationsUsecase";
import { GetPublicDoctorsUsecase } from "../../application/usecases/doctor/doctorManagement/getPublicDoctorsUsecase";
import { GetPublicDoctorProfileUsecase } from "../../application/usecases/doctor/doctorManagement/getPublicDoctorProfileUsecase";
import { DUpdateProfileImageUsecase } from "../../application/usecases/doctor/doctorProfile/dUpdateProfileImageUsecase";
import { DUpdateBannerImageUsecase } from "../../application/usecases/doctor/doctorProfile/dUpdateBannerImageUsecase";
import { DGetProfileImageUploadSignedUrlUsecase } from "../../application/usecases/doctor/doctorProfile/dGetProfileImageUploadSignedUrlUsecase";
import { DGetBannerImageUploadSignedUrlUsecase } from "../../application/usecases/doctor/doctorProfile/dGetBannerImageUploadSignedUrlUsecase";
import { DGetProfileImageAccessUrlUsecase } from "../../application/usecases/doctor/doctorProfile/dGetProfileImageAccessUrlUsecase";
import { DGetBannerImageAccessUrlUsecase } from "../../application/usecases/doctor/doctorProfile/dGetBannerImageAccessUrlUsecase";
import { DGetPracticeDetails } from "../../application/usecases/doctor/doctorOnboarding/dGetPracticeDetails";
import { getFullCalendarSlotsUsecase } from "./slot";
import { GetDoctorAnalyticsUseCase } from "../../application/usecases/doctor/doctorManagement/GetDoctorAnalyticsUsecase";

// Services
const s3Service = new S3Service();

// Repositories
const doctorProfileRepository = new DoctorProfileRepository();
const authRepository = new AuthRepository();
const organizationRepository = new OrganizationRepository();

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
  authRepository,
  s3Service,
);
const dGetPracticeDetails = new DGetPracticeDetails(doctorProfileRepository);
const dSetupPractice = new DSetupPractice(
  doctorProfileRepository,
  organizationRepository,
  authRepository,
);
const dOnboardingStep4Usecase = new DOnboardingStep4Usecase(
  doctorProfileRepository,
  authRepository,
);
const dGetOnboardingStep4Usecase = new DGetOnboardingStep4Usecase(
  doctorProfileRepository,
);
const dResubmitProfileUsecase = new DResubmitProfileUsecase(
  doctorProfileRepository,
);
const dGetAllPracticeLocationsUsecase = new DGetAllPracticeLocationsUsecase(
  doctorProfileRepository,
);
const dGetPracticeLocationsUsecase = new DGetPracticeLocationsUsecase(
  doctorProfileRepository,
);
const getPublicDoctorsUsecase = new GetPublicDoctorsUsecase(
  doctorProfileRepository,
  getFullCalendarSlotsUsecase,
  s3Service,
);
const getPublicDoctorProfileUsecase = new GetPublicDoctorProfileUsecase(
  doctorProfileRepository,
  getFullCalendarSlotsUsecase,
  s3Service,
);
const dUpdateProfileImageUsecase = new DUpdateProfileImageUsecase(
  doctorProfileRepository,
);
const dUpdateBannerImageUsecase = new DUpdateBannerImageUsecase(
  doctorProfileRepository,
);
const dGetProfileImageUploadSignedUrlUsecase =
  new DGetProfileImageUploadSignedUrlUsecase(s3Service);
const dGetBannerImageUploadSignedUrlUsecase =
  new DGetBannerImageUploadSignedUrlUsecase(s3Service);
const dGetProfileImageAccessUrlUsecase = new DGetProfileImageAccessUrlUsecase(
  doctorProfileRepository,
  s3Service,
);
const dGetBannerImageAccessUrlUsecase = new DGetBannerImageAccessUrlUsecase(
  doctorProfileRepository,
  s3Service,
);
const getDoctorAnalyticsUseCase = new GetDoctorAnalyticsUseCase();


// Controllers
export const injectedDoctorController = new DoctorController(
  getAllDoctorsUsecase,
  getPublicDoctorsUsecase,
  getPublicDoctorProfileUsecase,
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
  dGetProfileImageUploadSignedUrlUsecase,
  dGetBannerImageUploadSignedUrlUsecase,
  dGetVerificationDocsUsecase,
  dSaveVerificationDocsUsecase,
  dGetPracticeDetails,
  dSetupPractice,
  dGetPracticeLocationsUsecase,
  dGetAllPracticeLocationsUsecase,
  dGetOnboardingStep4Usecase,
  dOnboardingStep4Usecase,
  dOnboardingStep6Usecase,
  dResubmitProfileUsecase,
  dUpdateProfileImageUsecase,
  dUpdateBannerImageUsecase,
  dGetProfileImageAccessUrlUsecase,
  dGetBannerImageAccessUrlUsecase,
  getDoctorAnalyticsUseCase,
);
