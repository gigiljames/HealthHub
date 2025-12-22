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
      ROUTES.DOCTOR.GET_SPECIALIZATION_LIST,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedDoctorController.getSpecializationList(req, res, next);
      }
    );

    this.doctorRouter.get(
      ROUTES.DOCTOR.GET_PROFILE_STAGE_1,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedDoctorController.getProfileStage1(req, res, next);
      }
    );

    this.doctorRouter.get(
      ROUTES.DOCTOR.GET_PROFILE_STAGE_2,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedDoctorController.getProfileStage2(req, res, next);
      }
    );

    this.doctorRouter.get(
      ROUTES.DOCTOR.GET_PROFILE_STAGE_3,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedDoctorController.getProfileStage3(req, res, next);
      }
    );

    this.doctorRouter.post(
      ROUTES.DOCTOR.SAVE_PROFILE_STAGE_1,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedDoctorController.saveProfileStage1(req, res, next);
      }
    );

    this.doctorRouter.post(
      ROUTES.DOCTOR.SAVE_PROFILE_STAGE_2,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedDoctorController.saveProfileStage2(req, res, next);
      }
    );

    this.doctorRouter.post(
      ROUTES.DOCTOR.SAVE_PROFILE_STAGE_3,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedDoctorController.saveProfileStage3(req, res, next);
      }
    );

    this.doctorRouter.post(
      ROUTES.DOCTOR.SAVE_PROFILE_STAGE_5,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedDoctorController.saveProfileStage5(req, res, next);
      }
    );
  }
}
