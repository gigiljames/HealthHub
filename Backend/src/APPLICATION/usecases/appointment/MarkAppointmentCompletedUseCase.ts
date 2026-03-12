import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus";

export class MarkAppointmentCompletedUseCase {
  constructor(private readonly appointmentRepository: IAppointmentRepository) {}

  async execute(appointmentId: string, doctorId: string): Promise<void> {
    const appointment =
      await this.appointmentRepository.findById(appointmentId);
    if (!appointment) throw new Error("Appointment not found");

    if (appointment.doctorId !== doctorId) {
      throw new Error("Unauthorized to modify this appointment.");
    }

    if (appointment.status !== AppointmentStatus.CONFIRMED) {
      throw new Error(
        "Only confirmed appointments can be marked as completed.",
      );
    }

    await this.appointmentRepository.updateStatus(
      appointmentId,
      AppointmentStatus.COMPLETED,
    );
  }
}
