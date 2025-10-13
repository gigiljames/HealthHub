import { NextFunction, Request, Response } from "express";
import { ISignupUsecase } from "../../../DOMAIN/interfaces/usecases/auth/ISignupUsecase";
import { ILoginUsecase } from "../../../DOMAIN/interfaces/usecases/auth/ILoginUsecase";
import { IAuthRepository } from "../../../DOMAIN/interfaces/repositories/IAuthRepository";
import { AuthRequestDTO } from "../../../APPLICATION/DTOs/auth/authDTO";
import { IResendOtpUsecase } from "../../../DOMAIN/interfaces/usecases/auth/IResendOtpUsecase";
import { ICompleteSignupUsecase } from "../../../DOMAIN/interfaces/usecases/auth/ICompleteSignupUsecase";
import { CompleteSignupRequestDTO } from "../../../APPLICATION/DTOs/auth/completeSignupDTO";
import ITokenService from "../../../DOMAIN/interfaces/services/ITokenService";
import { IForgotPasswordUsecase } from "../../../DOMAIN/interfaces/usecases/auth/IForgotPasswordUsecase";
import { IForgotPasswordVerifyOtpUsecase } from "../../../DOMAIN/interfaces/usecases/auth/IForgotPasswordVerifyOtpUsecase";
import { IResetPasswordUsecase } from "../../../DOMAIN/interfaces/usecases/auth/IResetPasswordUsecase";
import { Roles } from "../../../DOMAIN/enums/roles";
import { GoogleAuthRequestDTO } from "../../../APPLICATION/DTOs/auth/googleAuthDTO";
import { IGoogleAuthUsecase } from "../../../DOMAIN/interfaces/usecases/auth/IGoogleAuthUsecase";
import { logger } from "../../../utils/logger";

export class AuthController {
  constructor(
    private _signupUsecase: ISignupUsecase,
    private _completeSignupUsecase: ICompleteSignupUsecase,
    private _authRepository: IAuthRepository,
    private _loginUsercase: ILoginUsecase,
    private _resendOtpUsecase: IResendOtpUsecase,
    private _tokenService: ITokenService,
    private _forgotPasswordUsecase: IForgotPasswordUsecase,
    private _forgotPasswordVerifyOtpUsecase: IForgotPasswordVerifyOtpUsecase,
    private _resetPasswordUsecase: IResetPasswordUsecase,
    private _googleAuthUsecase: IGoogleAuthUsecase
  ) {}

  async googleAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const data: GoogleAuthRequestDTO = {
        token: req.body.token,
        role: req.body.role,
      };
      const user = await this._googleAuthUsecase.execute(data);
      const { refreshToken, tokenId } = this._tokenService.generateRefreshToken(
        {
          userId: user.id,
          role: data.role,
        }
      );
      //store tokenId in cache
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
      });
      const accessToken = this._tokenService.generateAccessToken({
        userId: user.id,
        role: user.role,
      });
      if (user) {
        res.json({
          success: true,
          message: "Logged in successfully.",
          userInfo: user,
          accessToken,
        });
      }
    } catch (error) {
      logger.error("ERROR: User Auth controller - googleAuth");
      next(error);
    }
  }

  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const data: AuthRequestDTO = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
      };
      await this._signupUsecase.execute(data);
      return res.json({ success: true, message: "OTP sent successfully." });
    } catch (error) {
      logger.error("ERROR: User Auth controller - signup");
      next(error);
    }
  }

  async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const data: AuthRequestDTO = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
      };
      await this._resendOtpUsecase.execute(data);
      return res.json({ success: true, message: "OTP resent successfully." });
    } catch (error) {
      logger.error("ERROR: User Auth controller - resendOtp");
      next(error);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const data: CompleteSignupRequestDTO = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role,
        otp: req.body.otp,
      };
      await this._completeSignupUsecase.execute(data);
      res.json({
        success: true,
        message: "Signed in successfully. Please login now.",
      });
    } catch (error) {
      logger.error("ERROR: User Auth controller - verifyOtp");
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data: AuthRequestDTO = {
        email: req.body.email,
        password: req.body.password,
        role: req.body.role,
      };
      const user = await this._loginUsercase.execute(data);
      const { refreshToken, tokenId } = this._tokenService.generateRefreshToken(
        {
          userId: user.id,
          role: data.role,
        }
      );
      //store tokenId in cache
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
      });
      const accessToken = this._tokenService.generateAccessToken({
        userId: user.id,
        role: user.role,
      });
      if (user) {
        res.json({
          success: true,
          message: "Logged in successfully.",
          userInfo: user,
          accessToken,
        });
      }
    } catch (error) {
      logger.error("ERROR: User Auth controller - login");
      next(error);
    }
  }

  refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken as string;
      if (!refreshToken) {
        throw new Error("Refresh token doesn't exist");
      }
      const payload = this._tokenService.verifyRefreshToken(refreshToken);
      // check tokenId in cache
      const accessToken = this._tokenService.generateAccessToken({
        userId: payload.userId,
        role: payload.role,
      });
      const data = this._tokenService.generateRefreshToken({
        userId: payload.userId,
        role: payload.role,
      });
      //store tokenId in cache
      res.cookie("refreshToken", data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.json({ success: true, accessToken });
    } catch (error) {
      logger.error("ERROR: User Auth controller - refresh");
      next(error);
    }
  }

  logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.json({ success: true, message: "Logged out successfully." });
      // token blacklisting here
      // const authHeader = req.headers.authorization;
      // if (authHeader && authHeader.startsWith("Bearer ")) {
      //   const accessToken = authHeader.split(" ")[1];
      // }
      // const refreshToken = req.cookies?.refreshToken;
      // if (refreshToken) {
      //   const payload = this.tokenService.verifyRefreshToken(refreshToken);
      //   if(payload){
      //     // take token Id from payload and remove it from cache
      //   }
      // }
    } catch (error) {
      logger.error("ERROR: User Auth controller - logout");
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      await this._forgotPasswordUsecase.execute(email);
      res.json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
      logger.error("ERROR: User Auth controller - forgotPassword");
      next(error);
    }
  }

  async forgotPasswordVerifyOtp(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { otp, email } = req.body;
      const token = await this._forgotPasswordVerifyOtpUsecase.execute(
        otp,
        email
      );
      res.json({ success: true, message: "Otp verified successfully.", token });
    } catch (error) {
      logger.error("ERROR: User Auth controller - forgotPasswordVerifyOtp");
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { password, email, token } = req.body;
      const role: Roles = await this._resetPasswordUsecase.execute(
        password,
        email,
        token
      );
      res.json({
        success: true,
        message: "Password changed successfully. Login to continue.",
        role,
      });
    } catch (error) {
      logger.error("ERROR: User Auth controller - resetPassword");
      next(error);
    }
  }
}
