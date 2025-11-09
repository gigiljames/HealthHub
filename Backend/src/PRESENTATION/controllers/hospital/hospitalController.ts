import { NextFunction, Request, Response } from "express";
import { IHProfileCreation1Usecase } from "../../../domain/interfaces/usecases/hospital/IHProfileCreation1Usecase";
import { IHProfileCreation2Usecase } from "../../../domain/interfaces/usecases/hospital/IHProfileCreation2Usecase";
import { IHProfileCreation3Usecase } from "../../../domain/interfaces/usecases/hospital/IHProfileCreation3Usecase";
import { IHProfileCreation4Usecase } from "../../../domain/interfaces/usecases/hospital/IHProfileCreation4Usecase";
import { IHGetProfileStage1Usecase } from "../../../domain/interfaces/usecases/hospital/IHGetProfileStage1Usecase";
import { IHGetProfileStage2Usecase } from "../../../domain/interfaces/usecases/hospital/IHGetProfileStage2Usecase";
import { IHGetProfileStage3Usecase } from "../../../domain/interfaces/usecases/hospital/IHGetProfileStage3Usecase";
import { IHGetProfileStage4Usecase } from "../../../domain/interfaces/usecases/hospital/IHGetProfileStage4Usecase";
import { logger } from "../../../utils/logger";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";
import {
  HProfileCreation1RequestSchema,
  HProfileCreation2RequestSchema,
  HProfileCreation3RequestSchema,
  HProfileCreation4RequestSchema,
  HProfileCreation5RequestSchema,
} from "../../validators/hospitalValidator";
import { IHProfileCreation5Usecase } from "../../../domain/interfaces/usecases/hospital/IHProfileCreation5Usecase";
import { IHGetProfileStage5Usecase } from "../../../domain/interfaces/usecases/hospital/IHGetProfileStage5Usecase";

export class HospitalController {
  constructor(
    private _hProfileCreation1Usecase: IHProfileCreation1Usecase,
    private _hProfileCreation2Usecase: IHProfileCreation2Usecase,
    private _hProfileCreation3Usecase: IHProfileCreation3Usecase,
    private _hProfileCreation4Usecase: IHProfileCreation4Usecase,
    private _hProfileCreation5Usecase: IHProfileCreation5Usecase,
    private _hGetProfileStage1Usecase: IHGetProfileStage1Usecase,
    private _hGetProfileStage2Usecase: IHGetProfileStage2Usecase,
    private _hGetProfileStage3Usecase: IHGetProfileStage3Usecase,
    private _hGetProfileStage4Usecase: IHGetProfileStage4Usecase,
    private _hGetProfileStage5Usecase: IHGetProfileStage5Usecase
  ) {}

  async getProfileStage1(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user) {
        const hospitalId = req.user.userId;
        const data = await this._hGetProfileStage1Usecase.execute(hospitalId);
        res.json({
          success: true,
          data,
          message: "Hospital profile stage 1 fetched successfully.",
        });
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR
        );
      }
    } catch (error) {
      logger.error("ERROR: Hospital controller - getProfileStage1");
      next(error);
    }
  }

  async getProfileStage2(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user) {
        const hospitalId = req.user.userId;
        const data = await this._hGetProfileStage2Usecase.execute(hospitalId);
        res.json({
          success: true,
          data,
          message: "Hospital profile stage 2 fetched successfully.",
        });
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR
        );
      }
    } catch (error) {
      logger.error("ERROR: Hospital controller - getProfileStage2");
      next(error);
    }
  }

  async getProfileStage3(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user) {
        const hospitalId = req.user.userId;
        const data = await this._hGetProfileStage3Usecase.execute(hospitalId);
        res.json({
          success: true,
          data,
          message: "Hospital profile stage 3 fetched successfully.",
        });
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR
        );
      }
    } catch (error) {
      logger.error("ERROR: Hospital controller - getProfileStage3");
      next(error);
    }
  }

  async getProfileStage4(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user) {
        const hospitalId = req.user.userId;
        const data = await this._hGetProfileStage4Usecase.execute(hospitalId);

        res.json({
          success: true,
          data,
          message: "Hospital profile stage 4 fetched successfully.",
        });
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR
        );
      }
    } catch (error) {
      logger.error("ERROR: Hospital controller - getProfileStage4");
      next(error);
    }
  }

  async getProfileStage5(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user) {
        const hospitalId = req.user.userId;
        const data = await this._hGetProfileStage5Usecase.execute(hospitalId);

        res.json({
          success: true,
          data,
          message: "Hospital profile stage 5 fetched successfully.",
        });
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR
        );
      }
    } catch (error) {
      logger.error("ERROR: Hospital controller - getProfileStage5");
      next(error);
    }
  }

  async saveProfileStage1(req: Request, res: Response, next: NextFunction) {
    try {
      const data = HProfileCreation1RequestSchema.safeParse(req.body);
      if (data.error) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.INVALID_REQUEST_BODY
        );
      }
      await this._hProfileCreation1Usecase.execute(data.data);
      res.json({
        success: true,
        message: "Hospital profile stage 1 saved successfully.",
      });
    } catch (error) {
      logger.error("ERROR: Hospital controller - saveProfileStage1");
      next(error);
    }
  }

  async saveProfileStage2(req: Request, res: Response, next: NextFunction) {
    try {
      const data = HProfileCreation2RequestSchema.safeParse(req.body);
      if (data.error) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.INVALID_REQUEST_BODY
        );
      }
      const returnData = await this._hProfileCreation2Usecase.execute(
        data.data
      );
      res.json({
        success: true,
        message: "Hospital profile stage 2 saved successfully.",
        data: returnData,
      });
    } catch (error) {
      logger.error("ERROR: Hospital controller - saveProfileStage2");
      next(error);
    }
  }

  async saveProfileStage3(req: Request, res: Response, next: NextFunction) {
    try {
      const data = HProfileCreation3RequestSchema.safeParse(req.body);
      if (data.error) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.INVALID_REQUEST_BODY
        );
      }
      const returnData = await this._hProfileCreation3Usecase.execute(
        data.data
      );
      res.json({
        success: true,
        message: "Hospital profile stage 3 saved successfully.",
        data: returnData,
      });
    } catch (error) {
      logger.error("ERROR: Hospital controller - saveProfileStage3");
      next(error);
    }
  }

  async saveProfileStage4(req: Request, res: Response, next: NextFunction) {
    try {
      const data = HProfileCreation4RequestSchema.safeParse(req.body);
      if (data.error) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.INVALID_REQUEST_BODY
        );
      }
      const returnData = await this._hProfileCreation4Usecase.execute(
        data.data
      );
      res.json({
        success: true,
        message: "Hospital profile stage 4 saved successfully.",
        data: returnData,
      });
    } catch (error) {
      logger.error("ERROR: Hospital controller - saveProfileStage4");
      next(error);
    }
  }

  async saveProfileStage5(req: Request, res: Response, next: NextFunction) {
    try {
      const data = HProfileCreation5RequestSchema.safeParse(req.body);
      if (data.error) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.INVALID_REQUEST_BODY
        );
      }
      const returnData = await this._hProfileCreation5Usecase.execute(
        data.data
      );
      res.json({
        success: true,
        message: "Hospital profile creation completed successfully.",
        data: returnData,
      });
    } catch (error) {
      logger.error("ERROR: Hospital controller - saveProfileStage5");
      next(error);
    }
  }
}
