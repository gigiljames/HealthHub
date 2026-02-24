import { Router } from "express";
import { ROUTES } from "../../../domain/constants/routes";
import { AuthRepository } from "../../../infrastructure/repositories/authRepository";
import TokenService from "../../../application/services/tokenService";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { Roles } from "../../../domain/enums/roles";
import { injectedOrganizationController } from "../../DI/organization";

const tokenService = new TokenService();
const authRepository = new AuthRepository();

export class OrganizationRoute {
  organizationRouter: Router;
  constructor() {
    this.organizationRouter = Router();
    this._setRoutes();
  }

  private _setRoutes() {
    this.organizationRouter.get(
      ROUTES.ORGANIZATION.LIST_ORGANIZATIONS,
      authMiddleware([Roles.DOCTOR, Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedOrganizationController.listOrganizations(req, res, next);
      },
    );
  }
}
