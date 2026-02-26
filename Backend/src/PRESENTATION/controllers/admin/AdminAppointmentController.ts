import { NextFunction, Request, Response } from "express";
import { logger } from "../../../utils/logger";
import { IGetAllAppointmentsUsecase } from "../../../domain/interfaces/usecases/appointment/IGetAllAppointmentsUsecase";
import { IGetAdminAppointmentByIdUsecase } from "../../../domain/interfaces/usecases/appointment/IGetAdminAppointmentByIdUsecase";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";

export class AdminAppointmentController {
  constructor(
    private readonly _getAppointmentsUsecase: IGetAllAppointmentsUsecase,
    private readonly _getAppointmentByIdUsecase: IGetAdminAppointmentByIdUsecase,
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
        tab = "ALL",
        search,
        status,
        mode,
        timeRange,
        sort,
        paymentStatus,
        doctorId,
        page,
        limit,
      } = req.query as any;
      const result = await this._getAppointmentsUsecase.execute(
        tab.toUpperCase(),
        {
          search,
          status,
          mode,
          timeRange,
          sort,
          paymentStatus,
          doctorId,
          page: page ? Number(page) : 1,
          limit: limit ? Number(limit) : 20,
        },
      );
      res.json({
        success: true,
        message: "Appointments fetched successfully.",
        ...result,
      });
    } catch (error) {
      logger.error("ERROR: AdminAppointmentController - getAppointments");
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
      const data = await this._getAppointmentByIdUsecase.execute(appointmentId);
      res.json({
        success: true,
        message: "Appointment fetched successfully.",
        data,
      });
    } catch (error) {
      logger.error("ERROR: AdminAppointmentController - getAppointmentById");
      next(error);
    }
  };
}
