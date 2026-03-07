/* eslint-disable @typescript-eslint/no-floating-promises */
import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { Roles } from "../../../domain/enums/roles";
import TokenService from "../../../application/services/tokenService";
import { AuthRepository } from "../../../infrastructure/repositories/authRepository";
import { ROUTES } from "../../../domain/constants/routes";
import { injectedTransactionController } from "../../DI/transaction";

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
      ROUTES.TRANSACTIONS.GET_TRANSACTIONS,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedTransactionController.getAllTransactions(req, res, next);
      },
    );
  }
}
