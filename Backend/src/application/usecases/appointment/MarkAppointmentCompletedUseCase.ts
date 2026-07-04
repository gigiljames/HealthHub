import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";
import { IMarkAppointmentCompletedUsecase } from "../../../domain/interfaces/usecases/appointment/IMarkAppointmentCompletedUsecase";

export class MarkAppointmentCompletedUseCase implements IMarkAppointmentCompletedUsecase {
  constructor(
    private readonly _appointmentRepository: IAppointmentRepository,
  ) {}

  async execute(appointmentId: string, doctorId: string): Promise<void> {
    const appointment =
      await this._appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.APPOINTMENT.NOT_FOUND,
      );
    }

    if (appointment.doctorId !== doctorId) {
      throw new CustomError(HttpStatusCodes.FORBIDDEN, MESSAGES.ACCESS_DENIED);
    }

    if (appointment.status !== AppointmentStatus.CONFIRMED) {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        "Only confirmed appointments can be marked as completed.",
      );
    }

    await this._appointmentRepository.updateStatus(
      appointmentId,
      AppointmentStatus.COMPLETED,
    );
  }
}
