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
import { IChangePasswordUsecase } from "../../../domain/interfaces/usecases/auth/IChangePasswordUsecase";
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
  ChangePasswordRequestSchema,
} from "../../validators/authValidator";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";
import { env } from "../../../config/envConfig";
import { HTTPResponseBuilder } from "../../../utils/httpResponseBuilder";

export class AuthController {
  constructor(
    private readonly _signupUsecase: ISignupUsecase,
    private readonly _completeSignupUsecase: ICompleteSignupUsecase,
    private readonly _authRepository: IAuthRepository,
    private readonly _loginUsercase: ILoginUsecase,
    private readonly _resendOtpUsecase: IResendOtpUsecase,
    private readonly _tokenService: ITokenService,
    private readonly _forgotPasswordUsecase: IForgotPasswordUsecase,
    private readonly _forgotPasswordVerifyOtpUsecase: IForgotPasswordVerifyOtpUsecase,
    private readonly _resetPasswordUsecase: IResetPasswordUsecase,
    private readonly _googleAuthUsecase: IGoogleAuthUsecase,
    private readonly _changePasswordUsecase: IChangePasswordUsecase,
  ) {}

  async googleAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const data = GoogleAuthRequestSchema.safeParse(req.body);
      if (data.error) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.INVALID_REQUEST_BODY,
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
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
      });
      const accessToken = this._tokenService.generateAccessToken({
        userId: user.id,
        role: user.role,
      });
      if (user) {
        HTTPResponseBuilder.buildSuccessResponse(
          req,
          res,
          HttpStatusCodes.OK,
          MESSAGES.AUTH.LOGGED_IN,
          { userInfo: user, accessToken },
        );
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
          MESSAGES.INVALID_REQUEST_BODY,
        );
      }
      await this._signupUsecase.execute(data.data);
      return HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        MESSAGES.AUTH.OTP_SENT,
      );
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
          MESSAGES.INVALID_REQUEST_BODY,
        );
      }
      await this._resendOtpUsecase.execute(data.data);
      return HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        MESSAGES.AUTH.OTP_RESENT,
      );
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
          MESSAGES.INVALID_REQUEST_BODY,
        );
      }
      await this._completeSignupUsecase.execute(data.data);
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        MESSAGES.AUTH.SIGNED_UP,
      );
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
          MESSAGES.INVALID_REQUEST_BODY,
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
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
      });
      const accessToken = this._tokenService.generateAccessToken({
        userId: user.id,
        role: user.role,
      });
      if (user) {
        HTTPResponseBuilder.buildSuccessResponse(
          req,
          res,
          HttpStatusCodes.OK,
          MESSAGES.AUTH.LOGGED_IN,
          { userInfo: user, accessToken },
        );
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
        throw new CustomError(
          HttpStatusCodes.UNAUTHORIZED,
          MESSAGES.AUTH.REFRESH_TOKEN_NOT_FOUND,
        );
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
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
      });
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Token refreshed successfully",
        { accessToken },
      );
    } catch (error) {
      logger.error("ERROR: User Auth controller - refresh");
      next(error);
    }
  }

  logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
      });
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        MESSAGES.AUTH.LOGGED_OUT,
      );
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
          MESSAGES.INVALID_REQUEST_BODY,
        );
      }
      await this._forgotPasswordUsecase.execute(data.data.email);
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        MESSAGES.AUTH.OTP_SENT,
      );
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
          MESSAGES.INVALID_REQUEST_BODY,
        );
      }
      const token = this._forgotPasswordVerifyOtpUsecase.execute(
        data.data.otp,
        data.data.email,
      );
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        MESSAGES.AUTH.OTP_VERIFIED,
        { token },
      );
    } catch (error) {
      logger.error("ERROR: User Auth controller - forgotPasswordVerifyOtp");
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const data = ResetPasswordRequestSchema.safeParse(req.body);
      if (data.error) {
        console.log(data);
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.INVALID_REQUEST_BODY,
        );
      }
      const role: Roles = await this._resetPasswordUsecase.execute(
        data.data.password,
        data.data.email,
        data.data.token,
      );
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        MESSAGES.AUTH.PASSWORD_CHANGED,
        { role },
      );
    } catch (error) {
      logger.error("ERROR: User Auth controller - resetPassword");
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const data = ChangePasswordRequestSchema.safeParse(req.body);
      if (data.error) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.INVALID_REQUEST_BODY,
        );
      }

      const userId = req.user?.userId;
      if (!userId) {
        throw new CustomError(
          HttpStatusCodes.UNAUTHORIZED,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }

      await this._changePasswordUsecase.execute(userId, data.data);
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        MESSAGES.AUTH.PASSWORD_CHANGED,
      );
    } catch (error) {
      logger.error("ERROR: User Auth controller - changePassword");
      next(error);
    }
  }
}

