import { NextFunction, Request, Response } from "express";
import { logger } from "../../../utils/logger";
import { IGetPatientAppointmentsUsecase } from "../../../domain/interfaces/usecases/appointment/IGetPatientAppointmentsUsecase";
import { IGetPatientAppointmentByIdUsecase } from "../../../domain/interfaces/usecases/appointment/IGetPatientAppointmentByIdUsecase";
import { IPreviewCancelAppointmentUseCase } from "../../../domain/interfaces/usecases/appointment/IPreviewCancelAppointmentUseCase";
import { ICancelAppointmentUseCase } from "../../../domain/interfaces/usecases/appointment/ICancelAppointmentUseCase";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";

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
      const {
        tab = "UPCOMING",
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
        req.user.userId,
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
          limit: limit ? Number(limit) : 10,
        },
      );
      res.json({
        success: true,
        message: "Appointments fetched successfully.",
        ...result,
      });
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
      const data = await this._previewCancelAppointmentUseCase.execute(
        appointmentId,
        req.user.userId,
      );
      res.json({
        success: true,
        message: "Cancellation preview fetched successfully.",
        data,
      });
    } catch (error) {
      logger.error("ERROR: PatientAppointmentController - previewCancel");
      next(error);
    }
  };
}
