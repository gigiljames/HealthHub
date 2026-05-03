/* eslint-disable @typescript-eslint/no-floating-promises */
import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { Roles } from "../../../domain/enums/roles";
import TokenService from "../../../application/services/tokenService";
import { AuthRepository } from "../../../infrastructure/repositories/authRepository";
import { ROUTES } from "../../../domain/constants/routes";
import { injectedAdminTransactionController } from "../../DI/transaction";
import { injectedAdminWalletController } from "../../DI/wallet";
import { injectedAdminDashboardController } from "../../DI/adminDashboard";

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
        injectedAdminTransactionController.getTransactions(req, res, next);
      },
    );

    this.adminRouter.get(
      ROUTES.TRANSACTIONS.GET_TRANSACTION,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedAdminTransactionController.getTransactionDetails(
          req,
          res,
          next,
        );
      },
    );

    this.adminRouter.get(
      ROUTES.ADMIN_WALLET.GET_WALLETS,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedAdminWalletController.getWallets(req, res, next);
      },
    );

    this.adminRouter.get(
      ROUTES.ADMIN_WALLET.GET_WALLET,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedAdminWalletController.getWalletDetails(req, res, next);
      },
    );

    this.adminRouter.get(
      ROUTES.ADMIN_WALLET.GET_WALLET_TRANSACTIONS,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedAdminWalletController.getWalletTransactions(req, res, next);
      },
    );

    this.adminRouter.get(
      ROUTES.ADMI_DASHBOARD.GET_STATS,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedAdminDashboardController.getStats(req, res, next);
      },
    );
  }
}
