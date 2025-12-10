/* eslint-disable @typescript-eslint/no-floating-promises */
import { Router } from "express";
import { injectedAdminController } from "../../DI/admin";
import TokenService from "../../../application/services/tokenService";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { Roles } from "../../../domain/enums/roles";
import { ROUTES } from "../../../domain/constants/routes";
import { AuthRepository } from "../../../infrastructure/repositories/authRepository";

const tokenService = new TokenService();
const authRepository = new AuthRepository();

export class AdminRoute {
  adminRouter: Router;
  constructor() {
    this.adminRouter = Router();
    this._setRoutes();
  }

  private _setRoutes() {
    this.adminRouter.get(
      ROUTES.ADMIN.GET_SPECIALIZATIONS,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedAdminController.getSpecializations(req, res, next);
      }
    );

    this.adminRouter.post(
      ROUTES.ADMIN.ADD_SPECIALIZATION,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedAdminController.addSpecialization(req, res, next);
      }
    );

    this.adminRouter.patch(
      ROUTES.ADMIN.EDIT_SPECIALIZATION,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedAdminController.editSpecialization(req, res, next);
      }
    );

    this.adminRouter.patch(
      ROUTES.ADMIN.ACTIVATE_SPECIALIZATION,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedAdminController.activateSpecialization(req, res, next);
      }
    );

    this.adminRouter.patch(
      ROUTES.ADMIN.DEACTIVATE_SPECIALIZATION,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedAdminController.deactivateSpecialization(req, res, next);
      }
    );

    this.adminRouter.get(
      ROUTES.ADMIN.GET_USERS,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedAdminController.getUsers(req, res, next);
      }
    );

    this.adminRouter.get(
      ROUTES.ADMIN.GET_USER_PROFILE,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedAdminController.getUserProfile(req, res, next);
      }
    );

    this.adminRouter.patch(
      ROUTES.ADMIN.BLOCK_USER,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedAdminController.blockUser(req, res, next);
      }
    );

    this.adminRouter.patch(
      ROUTES.ADMIN.UNBLOCK_USER,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedAdminController.unblockUser(req, res, next);
      }
    );

    this.adminRouter.get(
      ROUTES.ADMIN.GET_DOCTORS,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedAdminController.getDoctors(req, res, next);
      }
    );

    this.adminRouter.patch(
      ROUTES.ADMIN.BLOCK_DOCTOR,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedAdminController.blockDoctor(req, res, next);
      }
    );

    this.adminRouter.get(
      ROUTES.ADMIN.GET_HOSPITALS,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedAdminController.getHospitals(req, res, next);
      }
    );

    this.adminRouter.get(
      ROUTES.ADMIN.GET_HOSPITAL_PROFILE,
      authMiddleware([Roles.ADMIN], tokenService, authRepository)
    );

    this.adminRouter.patch(
      ROUTES.ADMIN.BLOCK_HOSPITAL,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedAdminController.blockHospital(req, res, next);
      }
    );

    this.adminRouter.patch(
      ROUTES.ADMIN.UNBLOCK_DOCTOR,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedAdminController.unblockDoctor(req, res, next);
      }
    );

    this.adminRouter.patch(
      ROUTES.ADMIN.UNBLOCK_HOSPITAL,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedAdminController.unblockHospital(req, res, next);
      }
    );

    this.adminRouter.get(
      ROUTES.ADMIN.GET_DOCTOR_PROFILE,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedAdminController.getDoctorProfile(req, res, next);
      }
    );

    this.adminRouter.patch(
      ROUTES.ADMIN.VERIFY_DOCTOR,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedAdminController.verifyDoctor(req, res, next);
      }
    );
  }
}
