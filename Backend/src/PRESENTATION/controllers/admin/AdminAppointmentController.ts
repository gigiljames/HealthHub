import { NextFunction, Request, Response } from "express";
import { logger } from "../../../utils/logger";
import { IGetAllAppointmentsUsecase } from "../../../domain/interfaces/usecases/appointment/IGetAllAppointmentsUsecase";
import { IGetAdminAppointmentByIdUsecase } from "../../../domain/interfaces/usecases/appointment/IGetAdminAppointmentByIdUsecase";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";
import { adminAppointmentListSchema } from "../../validators/appointmentValidator";

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
      const validatedQuery = adminAppointmentListSchema.safeParse({
        query: req.query,
      });
      if (!validatedQuery.success) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.BAD_REQUEST,
        );
      }

      const result = await this._getAppointmentsUsecase.execute(
        validatedQuery.data.query.tab,
        validatedQuery.data.query,
      );
      res.json({
        success: true,
        message: MESSAGES.APPOINTMENT.APPOINTMENTS_FETCHED_SUCCESSFULLY,
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
      if (!appointmentId) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.BAD_REQUEST,
        );
      }
      const data = await this._getAppointmentByIdUsecase.execute(appointmentId);
      res.json({
        success: true,
        message: MESSAGES.APPOINTMENT.APPOINTMENT_FETCHED_SUCCESSFULLY,
        data,
      });
    } catch (error) {
      logger.error("ERROR: AdminAppointmentController - getAppointmentById");
      next(error);
    }
  };
}
