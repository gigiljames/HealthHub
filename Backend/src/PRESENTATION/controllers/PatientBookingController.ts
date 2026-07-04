import { NextFunction, Request, Response } from "express";
import { LockSlotUseCase } from "../../application/usecases/slot/lockSlotUseCase";
import { IGetAppointmentSummaryUseCase } from "../../domain/interfaces/usecases/booking/IGetAppointmentSummaryUseCase";
import { HttpStatusCodes } from "../../domain/enums/httpStatusCodes";
import { IBookAppointmentUsecase } from "../../domain/interfaces/usecases/appointment/IBookAppointmentUsecase";
import { MESSAGES } from "../../domain/constants/messages";
import { CustomError } from "../../domain/entities/customError";
import { bookAppointmentSchema } from "../validators/appointmentValidator";
import { HTTPResponseBuilder } from "../../utils/httpResponseBuilder";

export class PatientBookingController {
  constructor(
    private readonly _lockSlotUseCase: LockSlotUseCase,
    private readonly _bookAppointmentUseCase: IBookAppointmentUsecase,
    private readonly _getAppointmentSummaryUseCase: IGetAppointmentSummaryUseCase,
  ) {}

  lockSlot = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { slotId } = req.params;
      const patientId = req.user?.userId;

      if (!slotId) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.BAD_REQUEST,
        );
      }

      if (!patientId) {
        throw new CustomError(
          HttpStatusCodes.UNAUTHORIZED,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }

      const lockedSlot = await this._lockSlotUseCase.execute(slotId, patientId);
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Slot locked successfully",
        lockedSlot,
      );
    } catch (error) {
      next(error);
    }
  };

  bookAppointment = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { slotId } = req.params;
      const parsedBody = bookAppointmentSchema.safeParse(req.body);
      if (!parsedBody.success) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.BAD_REQUEST,
        );
      }
      const { reason, amount, currency, paymentMode } = parsedBody.data;
      const patientId = req.user?.userId;

      if (!patientId) {
        throw new CustomError(
          HttpStatusCodes.UNAUTHORIZED,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }

      const result = await this._bookAppointmentUseCase.execute(
        slotId,
        patientId,
        reason,
        amount,
        currency,
        paymentMode,
      );

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Appointment booked successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  };

  getAppointmentSummary = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { slotId } = req.params;
      const patientId = req.user?.userId;

      if (!slotId) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.BAD_REQUEST,
        );
      }

      if (!patientId) {
        throw new CustomError(
          HttpStatusCodes.UNAUTHORIZED,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }

      const summary = await this._getAppointmentSummaryUseCase.execute(slotId);
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Appointment summary fetched successfully",
        summary,
      );
    } catch (error) {
      next(error);
    }
  };
}

