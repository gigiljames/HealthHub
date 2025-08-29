import { Request, Response } from "express";
import { ISendOtpUsecase } from "../../../1DOMAIN/interfaces/usecases/user/auth/ISendOtpUsecase";

export class UserAuthController {
  constructor(private sendOtpUsecase: ISendOtpUsecase) {}
  async signup(req: Request, res: Response) {
    try {
      const { name, email } = req.body;
      await this.sendOtpUsecase.execute(name, email);
      res.json({ success: true, message: "OTP sent successfully." });
    } catch (e) {
      console.log(e);
      console.log("ERROR: User Auth controller - signup");
    }
  }

  async resendOtp(req: Request, res: Response) {
    try {
      const { name, email } = req.body;
      await this.sendOtpUsecase.execute(name, email);
      res.json({ success: true, message: "OTP resent successfully." });
    } catch (e) {
      console.log(e);
      console.log("ERROR: User Auth controller - resendOtp");
    }
  }
}
