import { NextFunction, Request, Response } from "express";
import { logger } from "../../../utils/logger";
import { IGetDoctorDayScheduleUseCase } from "../../../domain/interfaces/usecases/doctor/IGetDoctorDayScheduleUseCase";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";

import { IGetDoctorAnalysisUseCase } from "../../../domain/interfaces/usecases/doctor/IGetDoctorAnalysisUseCase";
import { TimePeriod } from "../../../domain/enums/timePeriod";

export class DoctorDashboardController {
  constructor(
    private readonly _getDoctorDayScheduleUseCase: IGetDoctorDayScheduleUseCase,
    private readonly _getDoctorAnalysisUseCase: IGetDoctorAnalysisUseCase,
  ) {}

  getDaySchedule = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
      
      const now = new Date();
      const schedule = await this._getDoctorDayScheduleUseCase.execute(
        req.user.userId,
        now,
      );

      res.json({
        success: true,
        message: "Day schedule fetched successfully",
        data: schedule,
      });
    } catch (error) {
      logger.error("ERROR: DoctorDashboardController - getDaySchedule");
      next(error);
    }
  };

  getAnalysis = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
      
      const locationId = (req.query.locationId as string) || null;
      const period = (req.query.period as TimePeriod) || TimePeriod.DAILY;
      const duration = req.query.duration ? parseInt(req.query.duration as string, 10) : undefined;

      const analysis = await this._getDoctorAnalysisUseCase.execute(
        req.user.userId,
        locationId,
        period,
        duration,
      );

      res.json({
        success: true,
        message: "Doctor analysis fetched successfully",
        data: analysis,
      });
    } catch (error) {
      logger.error("ERROR: DoctorDashboardController - getAnalysis");
      next(error);
    }
  };
}
