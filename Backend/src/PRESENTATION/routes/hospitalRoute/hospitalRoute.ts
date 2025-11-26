import { Router } from "express";
import { ROUTES } from "../../../domain/constants/routes";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { Roles } from "../../../domain/enums/roles";
import TokenService from "../../../application/services/tokenService";
import { injectedHospitalController } from "../../DI/hospital";
import { AuthRepository } from "../../../infrastructure/repositories/authRepository";

const tokenService = new TokenService();
const authRepository = new AuthRepository();

export class HospitalRoute {
  hospitalRouter: Router;

  constructor() {
    this.hospitalRouter = Router();
    this._setRoutes();
  }

  private _setRoutes() {
    this.hospitalRouter.get(
      ROUTES.HOSPITAL.GET_PROFILE_STAGE_1,
      authMiddleware([Roles.HOSPITAL], tokenService, authRepository),
      (req, res, next) =>
        injectedHospitalController.getProfileStage1(req, res, next)
    );

    this.hospitalRouter.patch(
      ROUTES.HOSPITAL.SAVE_PROFILE_STAGE_1,
      authMiddleware([Roles.HOSPITAL], tokenService, authRepository),
      (req, res, next) =>
        injectedHospitalController.saveProfileStage1(req, res, next)
    );

    this.hospitalRouter.get(
      ROUTES.HOSPITAL.GET_PROFILE_STAGE_2,
      authMiddleware([Roles.HOSPITAL], tokenService, authRepository),
      (req, res, next) =>
        injectedHospitalController.getProfileStage2(req, res, next)
    );

    this.hospitalRouter.patch(
      ROUTES.HOSPITAL.SAVE_PROFILE_STAGE_2,
      authMiddleware([Roles.HOSPITAL], tokenService, authRepository),
      (req, res, next) =>
        injectedHospitalController.saveProfileStage2(req, res, next)
    );

    this.hospitalRouter.get(
      ROUTES.HOSPITAL.GET_PROFILE_STAGE_3,
      authMiddleware([Roles.HOSPITAL], tokenService, authRepository),
      (req, res, next) =>
        injectedHospitalController.getProfileStage3(req, res, next)
    );

    this.hospitalRouter.patch(
      ROUTES.HOSPITAL.SAVE_PROFILE_STAGE_3,
      authMiddleware([Roles.HOSPITAL], tokenService, authRepository),
      (req, res, next) =>
        injectedHospitalController.saveProfileStage3(req, res, next)
    );

    this.hospitalRouter.get(
      ROUTES.HOSPITAL.GET_PROFILE_STAGE_4,
      authMiddleware([Roles.HOSPITAL], tokenService, authRepository),
      (req, res, next) =>
        injectedHospitalController.getProfileStage4(req, res, next)
    );

    this.hospitalRouter.patch(
      ROUTES.HOSPITAL.SAVE_PROFILE_STAGE_4,
      authMiddleware([Roles.HOSPITAL], tokenService, authRepository),
      (req, res, next) =>
        injectedHospitalController.saveProfileStage4(req, res, next)
    );

    this.hospitalRouter.get(
      ROUTES.HOSPITAL.GET_PROFILE_STAGE_5,
      authMiddleware([Roles.HOSPITAL], tokenService, authRepository),
      (req, res, next) =>
        injectedHospitalController.getProfileStage5(req, res, next)
    );

    this.hospitalRouter.patch(
      ROUTES.HOSPITAL.SAVE_PROFILE_STAGE_5,
      authMiddleware([Roles.HOSPITAL], tokenService, authRepository),
      (req, res, next) =>
        injectedHospitalController.saveProfileStage5(req, res, next)
    );
  }
}
