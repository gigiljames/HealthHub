/* eslint-disable @typescript-eslint/no-floating-promises */
import { Router } from "express";
import { injectedAdminController } from "../../DI/admin";
import TokenService from "../../../application/services/tokenService";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { Roles } from "../../../domain/enums/roles";
import { ROUTES } from "../../../domain/constants/routes";

const tokenService = new TokenService();

export class AdminRoute {
  adminRouter: Router;
  constructor() {
    this.adminRouter = Router();
    this._setRoutes();
  }

  private _setRoutes() {
    this.adminRouter.get(
      ROUTES.ADMIN.GET_SPECIALIZATIONS,
      authMiddleware([Roles.ADMIN], tokenService),
      (req, res, next) => {
        injectedAdminController.getSpecializations(req, res, next);
      }
    );

    this.adminRouter.post(
      ROUTES.ADMIN.ADD_SPECIALIZATION,
      authMiddleware([Roles.ADMIN], tokenService),
      (req, res, next) => {
        injectedAdminController.addSpecialization(req, res, next);
      }
    );

    this.adminRouter.patch(
      ROUTES.ADMIN.EDIT_SPECIALIZATION,
      authMiddleware([Roles.ADMIN], tokenService),
      (req, res, next) => {
        injectedAdminController.editSpecialization(req, res, next);
      }
    );

    this.adminRouter.patch(
      ROUTES.ADMIN.ACTIVATE_SPECIALIZATION,
      authMiddleware([Roles.ADMIN], tokenService),
      (req, res, next) => {
        injectedAdminController.activateSpecialization(req, res, next);
      }
    );

    this.adminRouter.patch(
      ROUTES.ADMIN.DEACTIVATE_SPECIALIZATION,
      authMiddleware([Roles.ADMIN], tokenService),
      (req, res, next) => {
        injectedAdminController.deactivateSpecialization(req, res, next);
      }
    );

    this.adminRouter.get(
      ROUTES.ADMIN.GET_USERS,
      authMiddleware([Roles.ADMIN], tokenService),
      (req, res, next) => {
        injectedAdminController.getUsers(req, res, next);
      }
    );

    this.adminRouter.get(
      ROUTES.ADMIN.GET_USER_PROFILE,
      authMiddleware([Roles.ADMIN], tokenService),
      (req, res, next) => {
        injectedAdminController.getUserProfile(req, res, next);
      }
    );

    this.adminRouter.patch(
      ROUTES.ADMIN.BLOCK_USER,
      authMiddleware([Roles.ADMIN], tokenService),
      (req, res, next) => {
        injectedAdminController.blockUser(req, res, next);
      }
    );

    this.adminRouter.patch(
      ROUTES.ADMIN.UNBLOCK_USER,
      authMiddleware([Roles.ADMIN], tokenService),
      (req, res, next) => {
        injectedAdminController.unblockUser(req, res, next);
      }
    );

    this.adminRouter.get(
      ROUTES.ADMIN.GET_DOCTORS,
      authMiddleware([Roles.ADMIN], tokenService),
      (req, res, next) => {
        injectedAdminController.getDoctors(req, res, next);
      }
    );
  }
}
