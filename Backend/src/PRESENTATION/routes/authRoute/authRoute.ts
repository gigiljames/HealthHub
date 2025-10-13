/* eslint-disable @typescript-eslint/no-floating-promises */
import { Router } from "express";
import { injectedAuthController } from "../../DI/auth";
import { ROUTES } from "../../../DOMAIN/constants/routes";

export class AuthRoute {
  authRouter: Router;
  constructor() {
    this.authRouter = Router();
    this._setRoutes();
  }

  private _setRoutes() {
    this.authRouter.post(ROUTES.AUTH.GOOGLE_AUTH, (req, res, next) => {
      injectedAuthController.googleAuth(req, res, next);
    });
    this.authRouter.post(ROUTES.AUTH.SIGNUP, (req, res, next) =>
      injectedAuthController.signup(req, res, next)
    );
    this.authRouter.post(ROUTES.AUTH.RESEND_OTP, (req, res, next) =>
      injectedAuthController.resendOtp(req, res, next)
    );
    this.authRouter.post(ROUTES.AUTH.VERIFY_OTP, (req, res, next) => {
      injectedAuthController.verifyOtp(req, res, next);
    });
    this.authRouter.post(ROUTES.AUTH.LOGIN, (req, res, next) => {
      injectedAuthController.login(req, res, next);
    });
    this.authRouter.post(ROUTES.AUTH.LOGOUT, (req, res, next) => {
      injectedAuthController.logout(req, res, next);
    });
    this.authRouter.post(ROUTES.AUTH.FORGOT_PASSWORD, (req, res, next) => {
      injectedAuthController.forgotPassword(req, res, next);
    });
    this.authRouter.post(
      ROUTES.AUTH.FORGOT_PASSWORD_RESEND_OTP,
      (req, res, next) => {}
    );
    this.authRouter.post(
      ROUTES.AUTH.FORGOT_PASSWORD_VERIFY_OTP,
      (req, res, next) => {
        injectedAuthController.forgotPasswordVerifyOtp(req, res, next);
      }
    );
    this.authRouter.post(ROUTES.AUTH.RESET_PASSWORD, (req, res, next) => {
      injectedAuthController.resetPassword(req, res, next);
    });
    this.authRouter.get(ROUTES.AUTH.REFRESH_TOKEN, (req, res, next) => {
      injectedAuthController.refresh(req, res, next);
    });
  }
}
