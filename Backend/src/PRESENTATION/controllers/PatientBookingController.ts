import { NextFunction, Request, Response } from "express";
import { LockSlotUseCase } from "../../application/usecases/slot/lockSlotUseCase";
import { IGetAppointmentSummaryUseCase } from "../../domain/interfaces/usecases/booking/IGetAppointmentSummaryUseCase";
import { HttpStatusCodes } from "../../domain/enums/httpStatusCodes";
import { IBookAppointmentUsecase } from "../../domain/interfaces/usecases/appointment/IBookAppointmentUsecase";
import { MESSAGES } from "../../domain/constants/messages";
import { CustomError } from "../../domain/entities/customError";
import { bookAppointmentSchema } from "../validators/appointmentValidator";

export class PatientBookingController {
  constructor(
    private readonly lockSlotUseCase: LockSlotUseCase,
    private readonly bookAppointmentUseCase: IBookAppointmentUsecase,
    private readonly getAppointmentSummaryUseCase: IGetAppointmentSummaryUseCase,
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

      const lockedSlot = await this.lockSlotUseCase.execute(slotId, patientId);
      res.status(HttpStatusCodes.OK).json({ success: true, data: lockedSlot });
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

      const result = await this.bookAppointmentUseCase.execute(
        slotId,
        patientId,
        reason,
        amount,
        currency,
        paymentMode,
      );

      res.status(HttpStatusCodes.OK).json({ success: true, data: result });
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

      const summary = await this.getAppointmentSummaryUseCase.execute(slotId);
      res.status(HttpStatusCodes.OK).json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  };
}
