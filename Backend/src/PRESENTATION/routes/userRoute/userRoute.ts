/* eslint-disable @typescript-eslint/no-floating-promises */
import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import TokenService from "../../../APPLICATION/services/tokenService";
import { Roles } from "../../../DOMAIN/enums/roles";
import { injectedUserController } from "../../DI/user";
import { ROUTES } from "../../../DOMAIN/constants/routes";

const tokenService = new TokenService();

export class UserRoute {
  userRouter: Router;
  constructor() {
    this.userRouter = Router();
    this._setRoutes();
  }

  private _setRoutes() {
    this.userRouter.get(
      "/users",
      authMiddleware([Roles.USER], tokenService),
      (req, res) => {
        res.json({ message: "Hello" });
      }
    );

    this.userRouter.get(
      ROUTES.USER.GET_PROFILE_STAGE_1,
      authMiddleware([Roles.USER], tokenService),
      (req, res, next) => {
        injectedUserController.getProfileStage1(req, res, next);
      }
    );

    this.userRouter.patch(
      ROUTES.USER.SAVE_PROFILE_STAGE_1,
      authMiddleware([Roles.USER], tokenService),
      (req, res, next) => {
        injectedUserController.saveProfileStage1(req, res, next);
      }
    );

    this.userRouter.get(
      ROUTES.USER.GET_PROFILE_STAGE_2,
      authMiddleware([Roles.USER], tokenService),
      (req, res, next) => {
        injectedUserController.getProfileStage2(req, res, next);
      }
    );

    this.userRouter.patch(
      ROUTES.USER.SAVE_PROFILE_STAGE_2,
      authMiddleware([Roles.USER], tokenService),
      (req, res, next) => {
        injectedUserController.saveProfileStage2(req, res, next);
      }
    );

    this.userRouter.get(
      ROUTES.USER.GET_PROFILE_STAGE_3,
      authMiddleware([Roles.USER], tokenService),
      (req, res, next) => {
        injectedUserController.getProfileStage3(req, res, next);
      }
    );

    this.userRouter.patch(
      ROUTES.USER.SAVE_PROFILE_STAGE_3,
      authMiddleware([Roles.USER], tokenService),
      (req, res, next) => {
        injectedUserController.saveProfileStage3(req, res, next);
      }
    );

    this.userRouter.get(
      ROUTES.USER.GET_PROFILE_STAGE_4,
      authMiddleware([Roles.USER], tokenService),
      (req, res, next) => {
        injectedUserController.getProfileStage4(req, res, next);
      }
    );

    this.userRouter.patch(
      ROUTES.USER.SAVE_PROFILE_STAGE_4,
      authMiddleware([Roles.USER], tokenService),
      (req, res, next) => {
        injectedUserController.saveProfileStage4(req, res, next);
      }
    );
  }
}
