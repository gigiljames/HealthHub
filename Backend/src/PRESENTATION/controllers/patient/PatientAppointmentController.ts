import { NextFunction, Request, Response } from "express";
import { logger } from "../../../utils/logger";
import { IGetPatientAppointmentsUsecase } from "../../../domain/interfaces/usecases/appointment/IGetPatientAppointmentsUsecase";
import { IGetPatientAppointmentByIdUsecase } from "../../../domain/interfaces/usecases/appointment/IGetPatientAppointmentByIdUsecase";
import { IPreviewCancelAppointmentUseCase } from "../../../domain/interfaces/usecases/appointment/IPreviewCancelAppointmentUseCase";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";
import { patientAppointmentListSchema } from "../../validators/appointmentValidator";
import { HTTPResponseBuilder } from "../../../utils/httpResponseBuilder";

export class PatientAppointmentController {
  constructor(
    private readonly _getAppointmentsUsecase: IGetPatientAppointmentsUsecase,
    private readonly _getAppointmentByIdUsecase: IGetPatientAppointmentByIdUsecase,
    private readonly _previewCancelAppointmentUseCase: IPreviewCancelAppointmentUseCase,
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
      const parsedData = patientAppointmentListSchema.safeParse({
        query: req.query,
      });
      if (!parsedData.success) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.BAD_REQUEST,
        );
      }
      const result = await this._getAppointmentsUsecase.execute(
        req.user.userId,
        parsedData.data.query.tab,
        parsedData.data.query,
      );
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        MESSAGES.APPOINTMENT.APPOINTMENTS_FETCHED_SUCCESSFULLY,
        result,
      );
    } catch (error) {
      logger.error("ERROR: PatientAppointmentController - getAppointments");
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
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        MESSAGES.APPOINTMENT.APPOINTMENT_FETCHED_SUCCESSFULLY,
        data,
      );
    } catch (error) {
      logger.error("ERROR: PatientAppointmentController - getAppointmentById");
      next(error);
    }
  };

  previewCancel = async (
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
      const data = await this._previewCancelAppointmentUseCase.execute(
        appointmentId,
        req.user.userId,
      );
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        MESSAGES.APPOINTMENT.CANCELLATION_PREVIEW_FETCHED,
        data,
      );
    } catch (error) {
      logger.error("ERROR: PatientAppointmentController - previewCancel");
      next(error);
    }
  };
}

