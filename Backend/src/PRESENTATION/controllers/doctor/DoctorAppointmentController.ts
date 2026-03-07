import { NextFunction, Request, Response } from "express";
import { logger } from "../../../utils/logger";
import { IGetDoctorAppointmentsUsecase } from "../../../domain/interfaces/usecases/appointment/IGetDoctorAppointmentsUsecase";
import { IGetDoctorAppointmentByIdUsecase } from "../../../domain/interfaces/usecases/appointment/IGetDoctorAppointmentByIdUsecase";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";

export class DoctorAppointmentController {
  constructor(
    private readonly _getAppointmentsUsecase: IGetDoctorAppointmentsUsecase,
    private readonly _getAppointmentByIdUsecase: IGetDoctorAppointmentByIdUsecase,
  ) {}

  getAppointments = async (
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
      const {
        tab = "UPCOMING",
        search,
        status,
        mode,
        timeRange,
        startDate,
        endDate,
        sort,
        paymentStatus,
        page,
        limit,
      } = req.query as any;
      const result = await this._getAppointmentsUsecase.execute(
        req.user.userId,
        tab.toUpperCase(),
        {
          search,
          status,
          mode,
          timeRange,
          startDate,
          endDate,
          sort,
          paymentStatus,
          page: page ? Number(page) : 1,
          limit: limit ? Number(limit) : 10,
        },
      );
      res.json({
        success: true,
        message: "Appointments fetched successfully.",
        ...result,
      });
    } catch (error) {
      logger.error("ERROR: DoctorAppointmentController - getAppointments");
      next(error);
    }
  };

  getAppointmentById = async (
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
      const { appointmentId } = req.params;
      const data = await this._getAppointmentByIdUsecase.execute(
        appointmentId,
        req.user.userId,
      );
      res.json({
        success: true,
        message: "Appointment fetched successfully.",
        data,
      });
    } catch (error) {
      logger.error("ERROR: DoctorAppointmentController - getAppointmentById");
      next(error);
    }
  };
}
