import { Router } from "express";
import { ROUTES } from "../../../domain/constants/routes";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { Roles } from "../../../domain/enums/roles";
import TokenService from "../../../application/services/tokenService";
import { AuthRepository } from "../../../infrastructure/repositories/authRepository";
import { injectedSpecializationController } from "../../DI/specialization";

const tokenService = new TokenService();
const authRepository = new AuthRepository();

export class SpecializationRoute {
  specializationRouter: Router;
  constructor() {
    this.specializationRouter = Router();
    this._setRoutes();
  }

  private _setRoutes() {
    this.specializationRouter.get(
      ROUTES.SPECIALIZATION.GET_SPECIALIZATIONS,
      // authMiddleware(
      //   [Roles.ADMIN, Roles.DOCTOR, Roles.USER],
      //   tokenService,
      //   authRepository
      // ),
      (req, res, next) => {
        injectedSpecializationController.getSpecializations(req, res, next);
      },
    );

    this.specializationRouter.post(
      ROUTES.SPECIALIZATION.ADD_SPECIALIZATION,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedSpecializationController.addSpecialization(req, res, next);
      },
    );

    this.specializationRouter.patch(
      ROUTES.SPECIALIZATION.EDIT_SPECIALIZATION,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedSpecializationController.editSpecialization(req, res, next);
      },
    );

    this.specializationRouter.patch(
      ROUTES.SPECIALIZATION.ACTIVATE_SPECIALIZATION,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedSpecializationController.activateSpecialization(req, res, next);
      },
    );

    this.specializationRouter.patch(
      ROUTES.SPECIALIZATION.DEACTIVATE_SPECIALIZATION,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedSpecializationController.deactivateSpecialization(
          req,
          res,
          next,
        );
      },
    );
  }
}
