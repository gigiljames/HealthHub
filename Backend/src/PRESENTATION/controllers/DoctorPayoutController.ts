import { Request, Response } from "express";
import { MarkAppointmentCompletedUseCase } from "../../application/usecases/appointment/MarkAppointmentCompletedUseCase";
import { IGetDoctorPayoutsUseCase } from "../../domain/interfaces/usecases/payout/IGetDoctorPayoutsUseCase";
import { IGetPayoutDetailsUseCase } from "../../domain/interfaces/usecases/payout/IGetPayoutDetailsUseCase";
import { HttpStatusCodes } from "../../domain/enums/httpStatusCodes";
import { getPayoutsQuerySchema } from "../validators/payoutValidator";

export class DoctorPayoutController {
  constructor(
    private readonly markCompletedUseCase: MarkAppointmentCompletedUseCase,
    private readonly getDoctorPayoutsUseCase: IGetDoctorPayoutsUseCase,
    private readonly getPayoutDetailsUseCase: IGetPayoutDetailsUseCase,
  ) {}

  markAppointmentComplete = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const { appointmentId } = req.params;
      const doctorId = req.user?.userId;

      if (!doctorId) {
        res
          .status(HttpStatusCodes.UNAUTHORIZED)
          .json({ message: "Unauthorized" });
        return;
      }

      await this.markCompletedUseCase.execute(appointmentId, doctorId);
      res
        .status(HttpStatusCodes.OK)
        .json({ success: true, message: "Appointment marked completed." });
    } catch (error: any) {
      res
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ success: false, message: error.message });
    }
  };

  getPayouts = async (req: Request, res: Response): Promise<void> => {
    try {
      const doctorId = req.user?.userId;
      if (!doctorId) {
        res
          .status(HttpStatusCodes.UNAUTHORIZED)
          .json({ message: "Unauthorized" });
        return;
      }

      const filters = getPayoutsQuerySchema.parse(req.query);
      const result = await this.getDoctorPayoutsUseCase.execute(
        doctorId,
        filters,
      );

      res.status(HttpStatusCodes.OK).json({ success: true, data: result });
    } catch (error: any) {
      res
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ success: false, message: error.message });
    }
  };

  getPayoutDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.getPayoutDetailsUseCase.execute(id);

      res.status(HttpStatusCodes.OK).json({ success: true, data: result });
    } catch (error: any) {
      const status = error.statusCode || HttpStatusCodes.BAD_REQUEST;
      res.status(status).json({ success: false, message: error.message });
    }
  };
}
