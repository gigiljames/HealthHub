import { IAppointmentRepository } from "../../domain/interfaces/repositories/IAppointmentRepository";
import { AppointmentStatus } from "../../domain/enums/appointmentStatus";

export class AutoNoShowCron {
  constructor(private readonly appointmentRepository: IAppointmentRepository) {}

  async run(): Promise<void> {
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours

    try {
      const appointments =
        await this.appointmentRepository.getAppointmentsForNoShow(cutoffDate);

      let count = 0;
      for (const appointment of appointments) {
        await this.appointmentRepository.updateStatus(
          appointment.id as string,
          AppointmentStatus.NO_SHOW,
        );
        count++;
      }
      if (count > 0) {
        console.log(`[AutoNoShowCron] Marked ${count} appointments as NO_SHOW`);
      }
    } catch (error) {
      console.error("[AutoNoShowCron] Failure", error);
    }
  }
}
