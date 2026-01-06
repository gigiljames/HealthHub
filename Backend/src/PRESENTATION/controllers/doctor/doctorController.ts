import { NextFunction, Request, Response } from "express";
import { logger } from "../../../utils/logger";
import { IDGetSpecializationListUsecase } from "../../../domain/interfaces/usecases/doctor/IDGetSpecializationListUsecase";
import { IDProfileCreation5Usecase } from "../../../domain/interfaces/usecases/doctor/IDProfileCreation5Usecase";
import { IDProfileBasicInfoUsecase } from "../../../domain/interfaces/usecases/doctor/IDProfileBasicInfoUsecase";
import { IDProfileEducationUsecase } from "../../../domain/interfaces/usecases/doctor/IDProfileEducationUsecase";
import { IDProfileExperienceUsecase } from "../../../domain/interfaces/usecases/doctor/IDProfileExperienceUsecase";
import { IDGetProfileBasicInfoUsecase } from "../../../domain/interfaces/usecases/doctor/IDGetProfileBasicInfoUsecase";
import { IDGetProfileEducationUsecase } from "../../../domain/interfaces/usecases/doctor/IDGetProfileEducationUsecase";
import { IDGetProfileExperienceUsecase } from "../../../domain/interfaces/usecases/doctor/IDGetProfileExperienceUsecase";
import {
  doctorProfileBasicInfoSchema,
  doctorProfileEducationSchema,
  doctorProfileExperienceSchema,
} from "../../validators/doctorValidator";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";

export class DoctorController {
  constructor(
    private _dGetSpecializationListUsecase: IDGetSpecializationListUsecase,
    private _dProfileCreation5Usecase: IDProfileCreation5Usecase,
    private _dProfileBasicInfoUsecase: IDProfileBasicInfoUsecase,
    private _dProfileEducationUsecase: IDProfileEducationUsecase,
    private _dProfileExperienceUsecase: IDProfileExperienceUsecase,
    private _dGetProfileBasicInfoUsecase: IDGetProfileBasicInfoUsecase,
    private _dGetProfileEducationUsecase: IDGetProfileEducationUsecase,
    private _dGetProfileExperienceUsecase: IDGetProfileExperienceUsecase
  ) {}

  async getSpecializationList(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this._dGetSpecializationListUsecase.execute();
      res.json({
        success: true,
        data,
        message: "Specialization list fetched successfully.",
      });
    } catch (error) {
      logger.error("ERROR: Doctor controller - getSpecializationList");
      next(error);
    }
  }

  async saveProfileStage1(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = doctorProfileBasicInfoSchema.safeParse(req.body);

      if (!validation.success) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          validation.error.issues[0].message
        );
      }

      if (req.user) {
        await this._dProfileBasicInfoUsecase.execute(
          validation.data,
          req.user.userId
        );

        res.json({
          success: true,
          message: "Profile stage 1 saved successfully.",
        });
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR
        );
      }
    } catch (error) {
      logger.error("ERROR: Doctor controller - saveProfileStage1");
      next(error);
    }
  }

  async saveProfileStage2(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = doctorProfileEducationSchema.safeParse(req.body);

      if (!validation.success) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          validation.error.issues[0].message
        );
      }

      if (req.user) {
        await this._dProfileEducationUsecase.execute(
          validation.data,
          req.user.userId
        );

        res.json({
          success: true,
          message: "Profile stage 2 saved successfully.",
        });
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR
        );
      }
    } catch (error) {
      logger.error("ERROR: Doctor controller - saveProfileStage2");
      next(error);
    }
  }

  async saveProfileStage3(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = doctorProfileExperienceSchema.safeParse(req.body);

      if (!validation.success) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          validation.error.issues[0].message
        );
      }

      if (req.user) {
        await this._dProfileExperienceUsecase.execute(
          validation.data,
          req.user.userId
        );

        res.json({
          success: true,
          message: "Profile stage 3 saved successfully.",
        });
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR
        );
      }
    } catch (error) {
      logger.error("ERROR: Doctor controller - saveProfileStage3");
      next(error);
    }
  }

  async getProfileStage1(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user) {
        const data = await this._dGetProfileBasicInfoUsecase.execute(
          req.user.userId
        );
        res.json({
          success: true,
          data,
          message: "Profile stage 1 fetched successfully.",
        });
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR
        );
      }
    } catch (error) {
      logger.error("ERROR: Doctor controller - getProfileStage1");
      next(error);
    }
  }

  async getProfileStage2(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user) {
        const data = await this._dGetProfileEducationUsecase.execute(
          req.user.userId
        );
        res.json({
          success: true,
          data,
          message: "Profile stage 2 fetched successfully.",
        });
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR
        );
      }
    } catch (error) {
      logger.error("ERROR: Doctor controller - getProfileStage2");
      next(error);
    }
  }

  async getProfileStage3(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user) {
        const data = await this._dGetProfileExperienceUsecase.execute(
          req.user.userId
        );
        res.json({
          success: true,
          data,
          message: "Profile stage 3 fetched successfully.",
        });
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR
        );
      }
    } catch (error) {
      logger.error("ERROR: Doctor controller - getProfileStage3");
      next(error);
    }
  }

  async saveProfileStage5(req: Request, res: Response, next: NextFunction) {
    try {
      const { acceptedTerms, submissionDate } = req.body;

      if (acceptedTerms === undefined || !submissionDate) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.INVALID_REQUEST_BODY
        );
      }

      if (req.user) {
        await this._dProfileCreation5Usecase.execute({
          userId: req.user.userId,
          acceptedTerms,
          submissionDate: new Date(submissionDate),
        });

        res.json({
          success: true,
          message: "Profile stage 5 saved successfully.",
        });
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR
        );
      }
    } catch (error) {
      logger.error("ERROR: Doctor controller - saveProfileStage5");
      next(error);
    }
  }
}
