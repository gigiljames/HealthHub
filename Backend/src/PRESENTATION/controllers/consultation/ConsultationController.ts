import { Request, Response, NextFunction } from "express";
import { IJoinConsultationUseCase } from "../../../domain/interfaces/usecases/consultation/IJoinConsultationUseCase";
import { IEndConsultationUseCase } from "../../../domain/interfaces/usecases/consultation/IEndConsultationUseCase";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import {
  joinConsultationSchema,
  endConsultationSchema,
} from "../../validators/consultation/consultationValidators";
import { CustomError } from "../../../domain/entities/customError";

export class ConsultationController {
  constructor(
    private readonly joinConsultationUseCase: IJoinConsultationUseCase,
    private readonly endConsultationUseCase: IEndConsultationUseCase,
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
      const userId = (req as any).user?.userId;
      const role = (req as any).user?.role as "doctor" | "user" | "admin";

      if (!userId || !role) {
        throw new CustomError(
          HttpStatusCodes.UNAUTHORIZED as unknown as number,
          "Unauthorized",
        );
      }
      if (role !== "doctor" && role !== "user") {
        throw new CustomError(
          HttpStatusCodes.FORBIDDEN as unknown as number,
          "Only doctors and patients can join consultations",
        );
      }

      const consultation = await this.joinConsultationUseCase.execute(
        appointmentId,
        userId,
        role,
      );

      res.status(HttpStatusCodes.OK).json({
        success: true,
        data: consultation,
        message: "Successfully joined consultation",
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
      const doctorId = (req as any).user?.userId;
      const role = (req as any).user?.role;

      if (!doctorId || role !== "doctor") {
        throw new CustomError(
          HttpStatusCodes.FORBIDDEN as unknown as number,
          "Only doctors can end consultations",
        );
      }

      const consultation = await this.endConsultationUseCase.execute(
        appointmentId,
        doctorId,
      );

      res.status(HttpStatusCodes.OK).json({
        success: true,
        data: consultation,
        message: "Successfully ended consultation",
      });
    } catch (error) {
      next(error);
    }
  }
}
