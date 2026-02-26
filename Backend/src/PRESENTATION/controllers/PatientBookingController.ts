import { Request, Response } from "express";
import { LockSlotUseCase } from "../../application/usecases/booking/LockSlotUseCase";
import { BookAppointmentUseCase } from "../../application/usecases/booking/BookAppointmentUseCase";
import { HttpStatusCodes } from "../../domain/enums/httpStatusCodes";

export class PatientBookingController {
  constructor(
    private readonly lockSlotUseCase: LockSlotUseCase,
    private readonly bookAppointmentUseCase: BookAppointmentUseCase,
  ) {}

  lockSlot = async (req: Request, res: Response): Promise<void> => {
    try {
      const { slotId } = req.params;
      const patientId = req.user?.userId;

      if (!patientId) {
        res
          .status(HttpStatusCodes.UNAUTHORIZED)
          .json({ message: "Unauthorized" });
        return;
      }

      const lockedSlot = await this.lockSlotUseCase.execute(slotId, patientId);
      res.status(HttpStatusCodes.OK).json({ success: true, data: lockedSlot });
    } catch (error: any) {
      if (error.message.includes("no longer available")) {
        res
          .status(HttpStatusCodes.CONFLICT)
          .json({ success: false, message: error.message });
      } else {
        res
          .status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
          .json({ success: false, message: "Internal server error" });
      }
    }
  };

  bookAppointment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { slotId } = req.params;
      const { reason, amount, currency } = req.body;
      const patientId = req.user?.userId;

      if (!patientId) {
        res
          .status(HttpStatusCodes.UNAUTHORIZED)
          .json({ message: "Unauthorized" });
        return;
      }

      const result = await this.bookAppointmentUseCase.execute(
        slotId,
        patientId,
        reason,
        amount,
        currency || "USD",
      );

      res.status(HttpStatusCodes.OK).json({ success: true, data: result });
    } catch (error: any) {
      if (error.message.includes("lock has expired")) {
        res
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({ success: false, message: error.message });
      } else {
        res
          .status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
          .json({ success: false, message: error.message });
      }
    }
  };
}
