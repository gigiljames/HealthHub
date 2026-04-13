import { NextFunction, Request, Response } from "express";
import { logger } from "../../../utils/logger";
import { IGetDoctorAppointmentsUsecase } from "../../../domain/interfaces/usecases/appointment/IGetDoctorAppointmentsUsecase";
import { IGetDoctorAppointmentByIdUsecase } from "../../../domain/interfaces/usecases/appointment/IGetDoctorAppointmentByIdUsecase";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";
import { doctorAppointmentListSchema } from "../../validators/appointmentValidator";

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
      const parsedData = doctorAppointmentListSchema.safeParse({
        query: req.query,
      });
      if (!parsedData.success) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.BAD_REQUEST,
          parsedData.error.message,
        );
      }
      const result = await this._getAppointmentsUsecase.execute(
        req.user.userId,
        parsedData.data.query.tab,
        parsedData.data.query,
      );
      res.json({
        success: true,
        message: MESSAGES.APPOINTMENT.APPOINTMENTS_FETCHED_SUCCESSFULLY,
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
      if (!appointmentId) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.BAD_REQUEST,
        );
      }
      const data = await this._getAppointmentByIdUsecase.execute(
        appointmentId,
        req.user.userId,
      );
      res.json({
        success: true,
        message: MESSAGES.APPOINTMENT.APPOINTMENT_FETCHED_SUCCESSFULLY,
        data,
      });
    } catch (error) {
      logger.error("ERROR: DoctorAppointmentController - getAppointmentById");
      next(error);
    }
  };
}
