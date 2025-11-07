import { Router } from "express";
import { ROUTES } from "../../../domain/constants/routes";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { Roles } from "../../../domain/enums/roles";
import TokenService from "../../../application/services/tokenService";

const tokenService = new TokenService();

export class HospitalRoute {
  hospitalRouter: Router;

  constructor() {
    this.hospitalRouter = Router();
    this._setRoutes();
  }

  private _setRoutes() {
    this.hospitalRouter.get(
      ROUTES.HOSPITAL.GET_PROFILE_STAGE_1,
      authMiddleware([Roles.HOSPITAL], tokenService)
    );

    this.hospitalRouter.post(
      ROUTES.HOSPITAL.SAVE_PROFILE_STAGE_1,
      authMiddleware([Roles.HOSPITAL], tokenService)
    );

    this.hospitalRouter.get(
      ROUTES.HOSPITAL.GET_PROFILE_STAGE_2,
      authMiddleware([Roles.HOSPITAL], tokenService)
    );

    this.hospitalRouter.post(
      ROUTES.HOSPITAL.SAVE_PROFILE_STAGE_2,
      authMiddleware([Roles.HOSPITAL], tokenService)
    );

    this.hospitalRouter.get(
      ROUTES.HOSPITAL.GET_PROFILE_STAGE_3,
      authMiddleware([Roles.HOSPITAL], tokenService)
    );

    this.hospitalRouter.post(
      ROUTES.HOSPITAL.SAVE_PROFILE_STAGE_3,
      authMiddleware([Roles.HOSPITAL], tokenService)
    );

    this.hospitalRouter.get(
      ROUTES.HOSPITAL.GET_PROFILE_STAGE_4,
      authMiddleware([Roles.HOSPITAL], tokenService)
    );

    this.hospitalRouter.post(
      ROUTES.HOSPITAL.SAVE_PROFILE_STAGE_4,
      authMiddleware([Roles.HOSPITAL], tokenService)
    );
  }
}
