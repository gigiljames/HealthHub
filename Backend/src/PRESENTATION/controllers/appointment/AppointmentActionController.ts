import { NextFunction, Request, Response } from "express";
import { logger } from "../../../utils/logger";
import { ICancelAppointmentUseCase } from "../../../domain/interfaces/usecases/appointment/ICancelAppointmentUseCase";
import { ICancelDoctorAppointmentUseCase } from "../../../domain/interfaces/usecases/appointment/ICancelDoctorAppointmentUseCase";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";
import { Roles } from "../../../domain/enums/roles";

export class AppointmentActionController {
  constructor(
    private readonly _cancelPatientAppointmentUseCase: ICancelAppointmentUseCase,
    private readonly _cancelDoctorAppointmentUseCase: ICancelDoctorAppointmentUseCase,
  ) {}

  cancel = async (
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
      const { role, userId } = req.user;

      if (!role || !userId) {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }

      if (role === Roles.USER) {
        await this._cancelPatientAppointmentUseCase.execute(
          appointmentId,
          userId,
        );
        res.json({
          success: true,
          message: MESSAGES.APPOINTMENT.CANCELLED,
        });
        return;
      }

      if (role === Roles.DOCTOR) {
        const { reason } = req.body;
        if (!reason) {
          throw new CustomError(
            HttpStatusCodes.BAD_REQUEST,
            MESSAGES.APPOINTMENT.CANCELLATION_REASON_REQUIRED,
          );
        }
        await this._cancelDoctorAppointmentUseCase.execute(
          appointmentId,
          userId,
          reason,
        );
        res.json({
          success: true,
          message: MESSAGES.APPOINTMENT.CANCELLED,
        });
        return;
      }

      throw new CustomError(HttpStatusCodes.FORBIDDEN, MESSAGES.ACCESS_DENIED);
    } catch (error) {
      logger.error("ERROR: AppointmentActionController - cancel");
      next(error);
    }
  };
}
