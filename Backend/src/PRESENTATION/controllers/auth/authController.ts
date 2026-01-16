import { NextFunction, Request, Response } from "express";
import { ISignupUsecase } from "../../../domain/interfaces/usecases/auth/ISignupUsecase";
import { ILoginUsecase } from "../../../domain/interfaces/usecases/auth/ILoginUsecase";
import { IAuthRepository } from "../../../domain/interfaces/repositories/IAuthRepository";
import { IResendOtpUsecase } from "../../../domain/interfaces/usecases/auth/IResendOtpUsecase";
import { ICompleteSignupUsecase } from "../../../domain/interfaces/usecases/auth/ICompleteSignupUsecase";
import ITokenService from "../../../domain/interfaces/services/ITokenService";
import { IForgotPasswordUsecase } from "../../../domain/interfaces/usecases/auth/IForgotPasswordUsecase";
import { IForgotPasswordVerifyOtpUsecase } from "../../../domain/interfaces/usecases/auth/IForgotPasswordVerifyOtpUsecase";
import { IResetPasswordUsecase } from "../../../domain/interfaces/usecases/auth/IResetPasswordUsecase";
import { Roles } from "../../../domain/enums/roles";
import { IGoogleAuthUsecase } from "../../../domain/interfaces/usecases/auth/IGoogleAuthUsecase";
import { logger } from "../../../utils/logger";
import {
  AuthRequestSchema,
  CompleteSignupRequestSchema,
  ForgotPasswordRequestSchema,
  ForgotPasswordVerifyOtpRequestSchema,
  GoogleAuthRequestSchema,
  ResetPasswordRequestSchema,
} from "../../validators/authValidator";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";

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
      const data = GoogleAuthRequestSchema.safeParse(req.body);
      if (data.error) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.INVALID_REQUEST_BODY
        );
      }
      const user = await this._googleAuthUsecase.execute(data.data);
      const { refreshToken } = this._tokenService.generateRefreshToken({
        userId: user.id,
        role: data.data.role,
      });
      // this usecase also returns tokenId, use if needed
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
      const data = AuthRequestSchema.safeParse(req.body);
      if (data.error) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.INVALID_REQUEST_BODY
        );
      }
      await this._signupUsecase.execute(data.data);
      return res.json({ success: true, message: "OTP sent successfully." });
    } catch (error) {
      logger.error("ERROR: User Auth controller - signup");
      next(error);
    }
  }

  async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const data = AuthRequestSchema.safeParse(req.body);
      if (data.error) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.INVALID_REQUEST_BODY
        );
      }
      await this._resendOtpUsecase.execute(data.data);
      return res.json({ success: true, message: "OTP resent successfully." });
    } catch (error) {
      logger.error("ERROR: User Auth controller - resendOtp");
      next(error);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const data = CompleteSignupRequestSchema.safeParse(req.body);
      if (data.error) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.INVALID_REQUEST_BODY
        );
      }
      await this._completeSignupUsecase.execute(data.data);
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
      const data = AuthRequestSchema.safeParse(req.body);
      if (data.error) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.INVALID_REQUEST_BODY
        );
      }
      const user = await this._loginUsercase.execute(data.data);
      const { refreshToken } = this._tokenService.generateRefreshToken({
        userId: user.id,
        role: data.data.role,
      });
      // this usecase also returns tokenId, use if needed
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
      const data = ForgotPasswordRequestSchema.safeParse(req.body);
      if (data.error) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.INVALID_REQUEST_BODY
        );
      }
      await this._forgotPasswordUsecase.execute(data.data.email);
      res.json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
      logger.error("ERROR: User Auth controller - forgotPassword");
      next(error);
    }
  }

  forgotPasswordVerifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const data = ForgotPasswordVerifyOtpRequestSchema.safeParse(req.body);
      if (data.error) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.INVALID_REQUEST_BODY
        );
      }
      const token = this._forgotPasswordVerifyOtpUsecase.execute(
        data.data.otp,
        data.data.email
      );
      res.json({ success: true, message: "Otp verified successfully.", token });
    } catch (error) {
      logger.error("ERROR: User Auth controller - forgotPasswordVerifyOtp");
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const data = ResetPasswordRequestSchema.safeParse(req.body);
      if (data.error) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.INVALID_REQUEST_BODY
        );
      }
      const role: Roles = await this._resetPasswordUsecase.execute(
        data.data.password,
        data.data.email,
        data.data.token
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
