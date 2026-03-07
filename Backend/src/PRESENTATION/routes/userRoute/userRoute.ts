/* eslint-disable @typescript-eslint/no-floating-promises */
import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import TokenService from "../../../application/services/tokenService";
import { Roles } from "../../../domain/enums/roles";
import { injectedUserController } from "../../DI/user";
import { ROUTES } from "../../../domain/constants/routes";
import { AuthRepository } from "../../../infrastructure/repositories/authRepository";
import { injectedTransactionController } from "../../DI/transaction";
import { injectedWalletController } from "../../DI/wallet";

const tokenService = new TokenService();
const authRepository = new AuthRepository();

export class UserRoute {
  userRouter: Router;
  constructor() {
    this.userRouter = Router();
    this._setRoutes();
  }

  private _setRoutes() {
    this.userRouter.get(
      ROUTES.USER.GET_USERS,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedUserController.getUsers(req, res, next);
      },
    );

    this.userRouter.get(
      ROUTES.USER.GET_USER_PROFILE,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedUserController.getUserProfile(req, res, next);
      },
    );

    this.userRouter.patch(
      ROUTES.USER.BLOCK_USER,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedUserController.blockUser(req, res, next);
      },
    );

    this.userRouter.patch(
      ROUTES.USER.UNBLOCK_USER,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedUserController.unblockUser(req, res, next);
      },
    );
    // this.userRouter.get(
    //   "/users",
    //   authMiddleware([Roles.USER], tokenService, authRepository),
    //   (req, res) => {
    //     res.json({ message: "Hello" });
    //   }
    // );

    this.userRouter.get(
      ROUTES.USER.GET_PROFILE_STAGE_1,
      authMiddleware([Roles.USER], tokenService, authRepository),
      (req, res, next) => {
        injectedUserController.getProfileStage1(req, res, next);
      },
    );

    this.userRouter.patch(
      ROUTES.USER.SAVE_PROFILE_STAGE_1,
      authMiddleware([Roles.USER], tokenService, authRepository),
      (req, res, next) => {
        injectedUserController.saveProfileStage1(req, res, next);
      },
    );

    this.userRouter.get(
      ROUTES.USER.GET_PROFILE_STAGE_2,
      authMiddleware([Roles.USER], tokenService, authRepository),
      (req, res, next) => {
        injectedUserController.getProfileStage2(req, res, next);
      },
    );

    this.userRouter.patch(
      ROUTES.USER.SAVE_PROFILE_STAGE_2,
      authMiddleware([Roles.USER], tokenService, authRepository),
      (req, res, next) => {
        injectedUserController.saveProfileStage2(req, res, next);
      },
    );

    this.userRouter.get(
      ROUTES.USER.GET_PROFILE_STAGE_3,
      authMiddleware([Roles.USER], tokenService, authRepository),
      (req, res, next) => {
        injectedUserController.getProfileStage3(req, res, next);
      },
    );

    this.userRouter.patch(
      ROUTES.USER.SAVE_PROFILE_STAGE_3,
      authMiddleware([Roles.USER], tokenService, authRepository),
      (req, res, next) => {
        injectedUserController.saveProfileStage3(req, res, next);
      },
    );

    this.userRouter.get(
      ROUTES.USER.GET_PROFILE_STAGE_4,
      authMiddleware([Roles.USER], tokenService, authRepository),
      (req, res, next) => {
        injectedUserController.getProfileStage4(req, res, next);
      },
    );

    this.userRouter.patch(
      ROUTES.USER.SAVE_PROFILE_STAGE_4,
      authMiddleware([Roles.USER], tokenService, authRepository),
      (req, res, next) => {
        injectedUserController.saveProfileStage4(req, res, next);
      },
    );

    this.userRouter.get(
      ROUTES.TRANSACTIONS.GET_USER_TRANSACTIONS,
      authMiddleware([Roles.USER], tokenService, authRepository),
      (req, res, next) => {
        injectedTransactionController.getUserTransactions(req, res, next);
      },
    );

    this.userRouter.get(
      ROUTES.WALLET.GET_WALLET,
      authMiddleware([Roles.USER, Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedWalletController.getWallet(req, res, next);
      },
    );

    this.userRouter.post(
      ROUTES.WALLET.ADD_MONEY_TO_WALLET,
      authMiddleware([Roles.USER], tokenService, authRepository),
      (req, res, next) => {
        injectedWalletController.addMoney(req, res, next);
      },
    );
  }
}
