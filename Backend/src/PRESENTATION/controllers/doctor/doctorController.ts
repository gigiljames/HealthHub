import { NextFunction, Request, Response } from "express";
import { logger } from "../../../utils/logger";
import { IGetAllDoctorsUsecase } from "../../../domain/interfaces/usecases/doctor/doctorManagement/IGetAllDoctorsUsecase";
import { IBlockDoctorUsecase } from "../../../domain/interfaces/usecases/doctor/doctorManagement/IBlockDoctorUsecase";
import { IUnblockDoctorUsecase } from "../../../domain/interfaces/usecases/doctor/doctorManagement/IUnblockDoctorUsecase";
import { IGetDoctorProfileUsecase } from "../../../domain/interfaces/usecases/doctor/doctorManagement/IGetDoctorProfileUsecase";
import { IVerifyDoctorUsecase } from "../../../domain/interfaces/usecases/doctor/doctorManagement/IVerifyDoctorUsecase";
import { IDProfileCreation5Usecase } from "../../../domain/interfaces/usecases/doctor/doctorProfile/IDProfileCreation5Usecase";
import { IDProfileBasicInfoUsecase } from "../../../domain/interfaces/usecases/doctor/doctorProfile/IDProfileBasicInfoUsecase";
import { IDProfileEducationUsecase } from "../../../domain/interfaces/usecases/doctor/doctorProfile/IDProfileEducationUsecase";
import { IDProfileExperienceUsecase } from "../../../domain/interfaces/usecases/doctor/doctorProfile/IDProfileExperienceUsecase";
import { IDGetProfileBasicInfoUsecase } from "../../../domain/interfaces/usecases/doctor/doctorProfile/IDGetProfileBasicInfoUsecase";
import { IDGetProfileEducationUsecase } from "../../../domain/interfaces/usecases/doctor/doctorProfile/IDGetProfileEducationUsecase";
import { IDGetProfileExperienceUsecase } from "../../../domain/interfaces/usecases/doctor/doctorProfile/IDGetProfileExperienceUsecase";
import {
  doctorProfileBasicInfoSchema,
  doctorProfileEducationSchema,
  doctorProfileExperienceSchema,
} from "../../validators/doctorValidator";
import { getDoctorsSchema } from "../../validators/adminValidator";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";

export class DoctorController {
  constructor(
    private _getAllDoctorsUsecase: IGetAllDoctorsUsecase,
    private _blockDoctorUsecase: IBlockDoctorUsecase,
    private _unblockDoctorUsecase: IUnblockDoctorUsecase,
    private _getDoctorProfileUsecase: IGetDoctorProfileUsecase,
    private _verifyDoctorUsecase: IVerifyDoctorUsecase,
    private _dProfileCreation5Usecase: IDProfileCreation5Usecase,
    private _dProfileBasicInfoUsecase: IDProfileBasicInfoUsecase,
    private _dProfileEducationUsecase: IDProfileEducationUsecase,
    private _dProfileExperienceUsecase: IDProfileExperienceUsecase,
    private _dGetProfileBasicInfoUsecase: IDGetProfileBasicInfoUsecase,
    private _dGetProfileEducationUsecase: IDGetProfileEducationUsecase,
    private _dGetProfileExperienceUsecase: IDGetProfileExperienceUsecase
  ) {}

  async getDoctors(req: Request, res: Response, next: NextFunction) {
    try {
      const data = getDoctorsSchema.safeParse(req.query);
      if (data.error) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.INVALID_REQUEST_BODY
        );
      }
      const doctors = await this._getAllDoctorsUsecase.execute(data.data);
      res.json({
        success: true,
        message: "Doctors retrieved successfully",
        ...doctors,
      });
    } catch (error) {
      logger.error("ERROR: Admin controller - getDoctors");
      next(error);
    }
  }

  async getDoctorProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const doctor = await this._getDoctorProfileUsecase.execute(id);
      res.status(HttpStatusCodes.OK).json({
        success: true,
        message: "Doctor profile fetched successfully",
        doctor,
      });
    } catch (error) {
      logger.error("ERROR: Admin controller - getDoctorProfile");
      next(error);
    }
  }

  async blockDoctor(req: Request, res: Response, next: NextFunction) {
    try {
      const doctorId = req.params.id;
      await this._blockDoctorUsecase.execute(doctorId);
      res.json({
        success: true,
        message: "Doctor blocked successfully",
      });
    } catch (error) {
      logger.error("ERROR: Admin controller - blockDoctor");
      next(error);
    }
  }

  async unblockDoctor(req: Request, res: Response, next: NextFunction) {
    try {
      const doctorId = req.params.id;
      await this._unblockDoctorUsecase.execute(doctorId);
      res.json({
        success: true,
        message: "Doctor unblocked successfully",
      });
    } catch (error) {
      logger.error("ERROR: Admin controller - unblockDoctor");
      next(error);
    }
  }

  async verifyDoctor(req: Request, res: Response, next: NextFunction) {
    try {
      const doctorId = req.params.id;
      const { isApproved, verificationRemarks } = req.body;

      if (
        typeof isApproved !== "boolean" ||
        (isApproved === false && !verificationRemarks)
      ) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.INVALID_REQUEST_BODY
        );
      }

      await this._verifyDoctorUsecase.execute(
        doctorId,
        isApproved,
        verificationRemarks
      );

      res.json({
        success: true,
        message: isApproved
          ? "Doctor verified successfully"
          : "Doctor verification rejected",
      });
    } catch (error) {
      logger.error("ERROR: Admin controller - verifyDoctor");
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
