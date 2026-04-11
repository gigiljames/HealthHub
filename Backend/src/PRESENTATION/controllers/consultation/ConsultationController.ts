import { Request, Response, NextFunction } from "express";
import { IJoinConsultationUseCase } from "../../../domain/interfaces/usecases/consultation/IJoinConsultationUseCase";
import { IEndConsultationUseCase } from "../../../domain/interfaces/usecases/consultation/IEndConsultationUseCase";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import {
  joinConsultationSchema,
  endConsultationSchema,
} from "../../validators/consultation/consultationValidators";
import { CustomError } from "../../../domain/entities/customError";
import { MESSAGES } from "../../../domain/constants/messages";

export class ConsultationController {
  constructor(
    private readonly _joinConsultationUseCase: IJoinConsultationUseCase,
    private readonly _endConsultationUseCase: IEndConsultationUseCase,
  ) {}

  async joinConsultation(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const parsedData = joinConsultationSchema.safeParse(req);
      if (!parsedData.success) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          parsedData.error.issues[0].message,
        );
      }

      const { appointmentId } = parsedData.data.body;
      const userId = req.user?.userId;
      const role = req.user?.role as "doctor" | "user" | "admin";

      if (!userId || !role) {
        throw new CustomError(
          HttpStatusCodes.UNAUTHORIZED,
          MESSAGES.UNAUTHORIZED,
        );
      }
      if (role !== "doctor" && role !== "user") {
        throw new CustomError(
          HttpStatusCodes.FORBIDDEN,
          MESSAGES.ACCESS_DENIED,
        );
      }

      const consultation = await this._joinConsultationUseCase.execute(
        appointmentId,
        userId,
        role,
      );

      res.status(HttpStatusCodes.OK).json({
        success: true,
        data: consultation,
        message: MESSAGES.CONSULTATION.JOINED_CONSULTATION,
      });
    } catch (error) {
      next(error);
    }
  }

  async endConsultation(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const parsedData = endConsultationSchema.safeParse(req);
      if (!parsedData.success) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          parsedData.error.issues[0].message,
        );
      }

      const { appointmentId } = parsedData.data.body;
      const doctorId = req.user?.userId;
      const role = req.user?.role;

      if (!doctorId || role !== "doctor") {
        throw new CustomError(
          HttpStatusCodes.FORBIDDEN,
          MESSAGES.ACCESS_DENIED,
        );
      }

      const consultation = await this._endConsultationUseCase.execute(
        appointmentId,
        doctorId,
      );

      res.status(HttpStatusCodes.OK).json({
        success: true,
        data: consultation,
        message: MESSAGES.CONSULTATION.ENDED_CONSULTATION,
      });
    } catch (error) {
      next(error);
    }
  }
}
