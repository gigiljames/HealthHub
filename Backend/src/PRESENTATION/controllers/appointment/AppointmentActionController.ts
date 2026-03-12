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
      const { role, userId } = req.user;

      if (role === Roles.USER) {
        await this._cancelPatientAppointmentUseCase.execute(
          appointmentId,
          userId,
        );
        res.json({
          success: true,
          message: "Appointment cancelled successfully.",
        });
        return;
      }

      if (role === Roles.DOCTOR) {
        const { reason } = req.body;
        if (!reason) {
          throw new CustomError(
            HttpStatusCodes.BAD_REQUEST,
            "Cancellation reason is required.",
          );
        }
        await this._cancelDoctorAppointmentUseCase.execute(
          appointmentId,
          userId,
          reason,
        );
        res.json({
          success: true,
          message: "Appointment cancelled successfully.",
        });
        return;
      }

      throw new CustomError(
        HttpStatusCodes.FORBIDDEN,
        "Invalid role for cancellation.",
      );
    } catch (error) {
      logger.error("ERROR: AppointmentActionController - cancel");
      next(error);
    }
  };
}
