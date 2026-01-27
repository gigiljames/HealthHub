import { Router } from "express";
import { ROUTES } from "../../../domain/constants/routes";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { Roles } from "../../../domain/enums/roles";
import TokenService from "../../../application/services/tokenService";
import { AuthRepository } from "../../../infrastructure/repositories/authRepository";
import { injectedDoctorController } from "../../DI/doctor";

const tokenService = new TokenService();
const authRepository = new AuthRepository();

export class DoctorRoute {
  doctorRouter: Router;
  constructor() {
    this.doctorRouter = Router();
    this._setRoutes();
  }

  private _setRoutes() {
    this.doctorRouter.get(
      ROUTES.DOCTOR.GET_DOCTORS,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedDoctorController.getDoctors(req, res, next);
      },
    );

    this.doctorRouter.patch(
      ROUTES.DOCTOR.BLOCK_DOCTOR,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedDoctorController.blockDoctor(req, res, next);
      },
    );

    this.doctorRouter.patch(
      ROUTES.DOCTOR.UNBLOCK_DOCTOR,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedDoctorController.unblockDoctor(req, res, next);
      },
    );

    this.doctorRouter.get(
      ROUTES.DOCTOR.GET_DOCTOR_PROFILE,
      authMiddleware([Roles.ADMIN, Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedDoctorController.getDoctorProfile(req, res, next);
      },
    );

    this.doctorRouter.patch(
      ROUTES.DOCTOR.VERIFY_DOCTOR,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedDoctorController.verifyDoctor(req, res, next);
      },
    );

    this.doctorRouter.get(
      ROUTES.DOCTOR.GET_PROFILE_STAGE_1,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedDoctorController.getProfileStage1(req, res, next);
      },
    );

    this.doctorRouter.get(
      ROUTES.DOCTOR.GET_PROFILE_STAGE_2,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedDoctorController.getProfileStage2(req, res, next);
      },
    );

    this.doctorRouter.get(
      ROUTES.DOCTOR.GET_PROFILE_STAGE_3,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedDoctorController.getProfileStage3(req, res, next);
      },
    );

    this.doctorRouter.post(
      ROUTES.DOCTOR.SAVE_PROFILE_STAGE_1,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedDoctorController.saveProfileStage1(req, res, next);
      },
    );

    this.doctorRouter.post(
      ROUTES.DOCTOR.SAVE_PROFILE_STAGE_2,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedDoctorController.saveProfileStage2(req, res, next);
      },
    );

    this.doctorRouter.post(
      ROUTES.DOCTOR.SAVE_PROFILE_STAGE_3,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedDoctorController.saveProfileStage3(req, res, next);
      },
    );

    this.doctorRouter.post(
      ROUTES.DOCTOR.ONBOARDING_STEP_6,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedDoctorController.saveOnboardingStep6(req, res, next);
      },
    );

    this.doctorRouter.post(
      ROUTES.DOCTOR.GET_MEDICAL_LICENSE_UPLOAD_SIGNED_URL,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedDoctorController.getMedicalLicenseUploadSignedUrl(
          req,
          res,
          next,
        );
      },
    );

    this.doctorRouter.post(
      ROUTES.DOCTOR.GET_DEGREE_CERTIFICATE_UPLOAD_SIGNED_URL,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedDoctorController.getDegreeCertificateUploadSignedUrl(
          req,
          res,
          next,
        );
      },
    );

    this.doctorRouter.get(
      ROUTES.DOCTOR.GET_VERIFICATION_DOCS,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedDoctorController.getVerificationDocs(req, res, next);
      },
    );

    this.doctorRouter.patch(
      ROUTES.DOCTOR.SAVE_VERIFICATION_DOCS,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedDoctorController.saveVerificationDocs(req, res, next);
      },
    );

    this.doctorRouter.patch(
      ROUTES.DOCTOR.PRACTICE_DETAILS,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedDoctorController.setupPractice(req, res, next);
      },
    );

    this.doctorRouter.patch(
      ROUTES.DOCTOR.ONBOARDING_STEP_4,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedDoctorController.saveOnboardingStep4(req, res, next);
      },
    );

    this.doctorRouter.get(
      ROUTES.DOCTOR.ONBOARDING_STEP_4,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedDoctorController.getOnboardingStep4(req, res, next);
      },
    );

    this.doctorRouter.patch(
      ROUTES.DOCTOR.RESUBMIT_PROFILE,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedDoctorController.resubmitProfile(req, res, next);
      },
    );
  }
}
