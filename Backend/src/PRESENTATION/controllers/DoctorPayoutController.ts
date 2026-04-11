import { NextFunction, Request, Response } from "express";
import { IGetDoctorPayoutsUseCase } from "../../domain/interfaces/usecases/payout/IGetDoctorPayoutsUseCase";
import { IGetPayoutDetailsUseCase } from "../../domain/interfaces/usecases/payout/IGetPayoutDetailsUseCase";
import { HttpStatusCodes } from "../../domain/enums/httpStatusCodes";
import { getPayoutsQuerySchema } from "../validators/payoutValidator";
import { IMarkAppointmentCompletedUsecase } from "../../domain/interfaces/usecases/appointment/IMarkAppointmentCompletedUsecase";
import { CustomError } from "../../domain/entities/customError";
import { MESSAGES } from "../../domain/constants/messages";

export class DoctorPayoutController {
  constructor(
    private readonly _markCompletedUseCase: IMarkAppointmentCompletedUsecase,
    private readonly _getDoctorPayoutsUseCase: IGetDoctorPayoutsUseCase,
    private readonly _getPayoutDetailsUseCase: IGetPayoutDetailsUseCase,
  ) {}

  markAppointmentComplete = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { appointmentId } = req.params;
      const doctorId = req.user?.userId;

      if (!appointmentId) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.BAD_REQUEST,
        );
      }

      if (!doctorId) {
        throw new CustomError(
          HttpStatusCodes.UNAUTHORIZED,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }

      await this._markCompletedUseCase.execute(appointmentId, doctorId);
      res.status(HttpStatusCodes.OK).json({
        success: true,
        message: MESSAGES.APPOINTMENT.MARKED_COMPLETED,
      });
    } catch (error) {
      next(error);
    }
  };

  getPayouts = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const doctorId = req.user?.userId;
      if (!doctorId) {
        throw new CustomError(
          HttpStatusCodes.UNAUTHORIZED,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }

      const filters = getPayoutsQuerySchema.parse(req.query);
      const result = await this._getDoctorPayoutsUseCase.execute(
        doctorId,
        filters,
      );

      res.status(HttpStatusCodes.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  getPayoutDetails = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.BAD_REQUEST,
        );
      }
      const result = await this._getPayoutDetailsUseCase.execute(id);

      res.status(HttpStatusCodes.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}
