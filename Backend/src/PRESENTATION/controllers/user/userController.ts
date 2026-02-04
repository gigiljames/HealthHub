import { NextFunction, Request, Response } from "express";
import { IGetUsersUsecase } from "../../../domain/interfaces/usecases/user/userManagement/IGetUsersUsecase";
import { IGetUserProfileUsecase } from "../../../domain/interfaces/usecases/user/userManagement/IGetUserProfileUsecase";
import { IBlockUserUsecase } from "../../../domain/interfaces/usecases/user/userManagement/IBlockUserUsecase";
import { IUnblockUserUsecase } from "../../../domain/interfaces/usecases/user/userManagement/IUnblockUserUsecase";
import { GetUsersRequestDTO } from "../../../application/DTOs/user/userManagementDTO";
import { IUProfileCreation1Usecase } from "../../../domain/interfaces/usecases/user/userProfile/IUProfileCreation1Usecase";
import { IUProfileCreation2Usecase } from "../../../domain/interfaces/usecases/user/userProfile/IUProfileCreation2Usecase";
import { IUProfileCreation3Usecase } from "../../../domain/interfaces/usecases/user/userProfile/IUProfileCreation3Usecase";
import { IUProfileCreation4Usecase } from "../../../domain/interfaces/usecases/user/userProfile/IUProfileCreation4Usecase";
import { IUGetProfileStage1Usecase } from "../../../domain/interfaces/usecases/user/userProfile/IUGetProfileStage1Usecase";
import { IUGetProfileStage2Usecase } from "../../../domain/interfaces/usecases/user/userProfile/IUGetProfileStage2Usecase";
import { IUGetProfileStage3Usecase } from "../../../domain/interfaces/usecases/user/userProfile/IUGetProfileStage3Usecase";
import { IUGetProfileStage4Usecase } from "../../../domain/interfaces/usecases/user/userProfile/IUGetProfileStage4Usecase";
import { logger } from "../../../utils/logger";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";
import {
  UProfileCreation1RequestSchema,
  UProfileCreation2RequestSchema,
  UProfileCreation3RequestSchema,
  UProfileCreation4RequestSchema,
} from "../../validators/userValidator";

export class UserController {
  constructor(
    private _getUsersUsecase: IGetUsersUsecase,
    private _getUserProfileUsecase: IGetUserProfileUsecase,
    private _blockUserUsecase: IBlockUserUsecase,
    private _unblockUserUsecase: IUnblockUserUsecase,
    private _uProfileCreation1Usecase: IUProfileCreation1Usecase,
    private _uProfileCreation2Usecase: IUProfileCreation2Usecase,
    private _uProfileCreation3Usecase: IUProfileCreation3Usecase,
    private _uProfileCreation4Usecase: IUProfileCreation4Usecase,
    private _uGetProfileStage1Usecase: IUGetProfileStage1Usecase,
    private _uGetProfileStage2Usecase: IUGetProfileStage2Usecase,
    private _uGetProfileStage3Usecase: IUGetProfileStage3Usecase,
    private _uGetProfileStage4Usecase: IUGetProfileStage4Usecase,
  ) {}

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const query: GetUsersRequestDTO = {
        search: req.query.search ? (req.query.search as string) : "",
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        sort: req.query.sort ? (req.query.sort as string) : "",
        blocked: req.query.blocked === "true" ? true : undefined,
        unblocked: req.query.unblocked === "true" ? true : undefined,
        newUser: req.query.newUser === "true" ? true : undefined,
      };
      const users = await this._getUsersUsecase.execute(query);
      res.json({
        success: true,
        message: "Users retrieved successfully",
        ...users,
      });
    } catch (error) {
      logger.error("ERROR: Admin controller - getUsers");
      next(error);
    }
  }

  async getUserProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;
      const userProfile = await this._getUserProfileUsecase.execute(userId);
      res.json({
        success: true,
        message: "User profile retrieved successfully",
        user: userProfile,
      });
    } catch (error) {
      logger.error("ERROR: Admin controller - getUserProfile");
      next(error);
    }
  }

  async blockUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;
      await this._blockUserUsecase.execute({ id: userId });
      res.json({
        success: true,
        message: "User blocked successfully",
      });
    } catch (error) {
      logger.error("ERROR: Admin controller - blockUser");
      next(error);
    }
  }

  async unblockUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;
      await this._unblockUserUsecase.execute({ id: userId });
      res.json({
        success: true,
        message: "User unblocked successfully",
      });
    } catch (error) {
      logger.error("ERROR: Admin controller - unblockUser");
      next(error);
    }
  }

  async getProfileStage1(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user) {
        const userId = req.user.userId;
        const data = await this._uGetProfileStage1Usecase.execute(userId);
        res.json({
          success: true,
          data,
          message: "Profile stage 1 fetched successfully.",
        });
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
    } catch (error) {
      logger.error("ERROR: User controller - getProfileStage1");
      next(error);
    }
  }

  async getProfileStage2(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user) {
        const userId = req.user.userId;
        const data = await this._uGetProfileStage2Usecase.execute(userId);
        res.json({
          success: true,
          data,
          message: "Profile stage 2 fetched successfully.",
        });
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
    } catch (error) {
      logger.error("ERROR: User controller - getProfileStage2");
      next(error);
    }
  }

  async getProfileStage3(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user) {
        const userId = req.user.userId;
        const data = await this._uGetProfileStage3Usecase.execute(userId);
        res.json({
          success: true,
          data,
          message: "Profile stage 3 fetched successfully.",
        });
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
    } catch (error) {
      logger.error("ERROR: User controller - getProfileStage3");
      next(error);
    }
  }

  async getProfileStage4(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user) {
        const userId = req.user.userId;
        const data = await this._uGetProfileStage4Usecase.execute(userId);

        res.json({
          success: true,
          data,
          message: "Profile stage 4 fetched successfully.",
        });
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
    } catch (error) {
      logger.error("ERROR: User controller - getProfileStage4");
      next(error);
    }
  }

  async saveProfileStage1(req: Request, res: Response, next: NextFunction) {
    try {
      const data = UProfileCreation1RequestSchema.safeParse(req.body);
      if (data.error) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.INVALID_REQUEST_BODY,
        );
      }
      await this._uProfileCreation1Usecase.execute(data.data);
      res.json({
        success: true,
        message: "Saved successfully",
      });
    } catch (error) {
      logger.error("ERROR: User controller - saveProfileStage1");
      next(error);
    }
  }

  async saveProfileStage2(req: Request, res: Response, next: NextFunction) {
    try {
      const data = UProfileCreation2RequestSchema.safeParse(req.body);
      if (data.error) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.INVALID_REQUEST_BODY,
        );
      }
      const returnData = await this._uProfileCreation2Usecase.execute(
        data.data,
      );
      res.json({
        success: true,
        message: "Saved successfully",
        data: returnData,
      });
    } catch (error) {
      logger.error("ERROR: User controller - saveProfileStage2");
      next(error);
    }
  }

  async saveProfileStage3(req: Request, res: Response, next: NextFunction) {
    try {
      const data = UProfileCreation3RequestSchema.safeParse(req.body);
      if (data.error) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.INVALID_REQUEST_BODY,
        );
      }
      const returnData = await this._uProfileCreation3Usecase.execute(
        data.data,
      );
      res.json({
        success: true,
        message: "Saved successfully",
        data: returnData,
      });
    } catch (error) {
      logger.error("ERROR: User controller - saveProfileStage3");
      next(error);
    }
  }

  async saveProfileStage4(req: Request, res: Response, next: NextFunction) {
    try {
      const data = UProfileCreation4RequestSchema.safeParse(req.body);
      if (data.error) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.INVALID_REQUEST_BODY,
        );
      }
      const returnData = await this._uProfileCreation4Usecase.execute(
        data.data,
      );
      res.json({
        success: true,
        message: "Profile creation completed.",
        data: returnData,
      });
    } catch (error) {
      logger.error("ERROR: User controller - saveProfileStage4");
      next(error);
    }
  }
}
