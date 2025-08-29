import { Router } from "express";
import { injectedUserAuthController } from "../../DI/user";

export class UserRoute {
  userRouter: Router;
  constructor() {
    this.userRouter = Router();
    this.setRoutes();
  }

  private setRoutes() {
    this.userRouter.post("/signup", (req, res) =>
      injectedUserAuthController.signup(req, res)
    );
    this.userRouter.post("/resend-otp", (req, res) =>
      injectedUserAuthController.resendOtp(req, res)
    );
    this.userRouter.post("/verify-otp", (req, res) => {});
  }
}
