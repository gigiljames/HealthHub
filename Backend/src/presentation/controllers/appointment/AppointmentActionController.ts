import { NextFunction, Request, Response } from "express";
import { logger } from "../../../utils/logger";
import { ICancelAppointmentUseCase } from "../../../domain/interfaces/usecases/appointment/ICancelAppointmentUseCase";
import { ICancelDoctorAppointmentUseCase } from "../../../domain/interfaces/usecases/appointment/ICancelDoctorAppointmentUseCase";
import { IRequestRescheduleUseCase } from "../../../domain/interfaces/usecases/appointment/IRequestRescheduleUseCase";
import { IAcceptRescheduleUseCase } from "../../../domain/interfaces/usecases/appointment/IAcceptRescheduleUseCase";
import { IDeclineRescheduleUseCase } from "../../../domain/interfaces/usecases/appointment/IDeclineRescheduleUseCase";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";
import { Roles } from "../../../domain/enums/roles";
import { HTTPResponseBuilder } from "../../../utils/httpResponseBuilder";

export class AppointmentActionController {
  constructor(
    private readonly _cancelPatientAppointmentUseCase: ICancelAppointmentUseCase,
    private readonly _cancelDoctorAppointmentUseCase: ICancelDoctorAppointmentUseCase,
    private readonly _requestRescheduleUseCase: IRequestRescheduleUseCase,
    private readonly _acceptRescheduleUseCase: IAcceptRescheduleUseCase,
    private readonly _declineRescheduleUseCase: IDeclineRescheduleUseCase,
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
        HTTPResponseBuilder.buildSuccessResponse(
          req,
          res,
          HttpStatusCodes.OK,
          MESSAGES.APPOINTMENT.CANCELLED,
        );
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
        HTTPResponseBuilder.buildSuccessResponse(
          req,
          res,
          HttpStatusCodes.OK,
          MESSAGES.APPOINTMENT.CANCELLED,
        );
        return;
      }

      throw new CustomError(HttpStatusCodes.FORBIDDEN, MESSAGES.ACCESS_DENIED);
    } catch (error) {
      logger.error("ERROR: AppointmentActionController - cancel");
      next(error);
    }
  };

  requestReschedule = async (
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
      const { newSlotId, reason, customReason } = req.body;
      const { userId, role } = req.user;

      if (role !== Roles.DOCTOR) {
        throw new CustomError(
          HttpStatusCodes.FORBIDDEN,
          MESSAGES.ACCESS_DENIED,
        );
      }

      if (!appointmentId || !newSlotId || !reason) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.BAD_REQUEST,
        );
      }

      await this._requestRescheduleUseCase.execute({
        appointmentId,
        doctorId: userId,
        newSlotId,
        reason,
        customReason,
      });

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        MESSAGES.APPOINTMENT.RESCHEDULE_SUBMITTED,
      );
    } catch (error) {
      logger.error("ERROR: AppointmentActionController - requestReschedule");
      next(error);
    }
  };

  acceptReschedule = async (
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
      const { userId, role } = req.user;

      if (role !== Roles.USER) {
        throw new CustomError(
          HttpStatusCodes.FORBIDDEN,
          MESSAGES.ACCESS_DENIED,
        );
      }

      if (!appointmentId) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.BAD_REQUEST,
        );
      }

      await this._acceptRescheduleUseCase.execute({
        appointmentId,
        patientId: userId,
      });

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        MESSAGES.APPOINTMENT.RESCHEDULE_ACCEPTED,
      );
    } catch (error) {
      logger.error("ERROR: AppointmentActionController - acceptReschedule");
      next(error);
    }
  };

  declineReschedule = async (
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
      const { userId, role } = req.user;

      if (role !== Roles.USER) {
        throw new CustomError(
          HttpStatusCodes.FORBIDDEN,
          MESSAGES.ACCESS_DENIED,
        );
      }

      if (!appointmentId) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.BAD_REQUEST,
        );
      }

      await this._declineRescheduleUseCase.execute({
        appointmentId,
        patientId: userId,
      });

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        MESSAGES.APPOINTMENT.RESCHEDULE_DECLINED,
      );
    } catch (error) {
      logger.error("ERROR: AppointmentActionController - declineReschedule");
      next(error);
    }
  };
}
