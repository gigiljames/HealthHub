import { Request, Response } from "express";
import { MarkAppointmentCompletedUseCase } from "../../application/usecases/booking/MarkAppointmentCompletedUseCase";
import { HttpStatusCodes } from "../../domain/enums/httpStatusCodes";

export class DoctorPayoutController {
  constructor(
    private readonly markCompletedUseCase: MarkAppointmentCompletedUseCase,
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
}
