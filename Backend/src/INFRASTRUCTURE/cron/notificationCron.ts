import cron from "node-cron";
import { IAppointmentRepository } from "../../domain/interfaces/repositories/IAppointmentRepository";
import { IEmailService } from "../../domain/interfaces/services/IEmailService";
import { ICreateNotificationUseCase } from "../../domain/interfaces/usecases/notification/ICreateNotificationUseCase";
import { Roles } from "../../domain/enums/roles";
import { NotificationType } from "../../domain/enums/notificationType";
import { logger } from "../../utils/logger";
import dayjs from "dayjs";

export class NotificationCronService {
  constructor(
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly emailService: IEmailService,
    private readonly createNotificationUseCase: ICreateNotificationUseCase,
  ) {}

  start() {
    // Run every minute
    cron.schedule("* * * * *", async () => {
      try {
        await this.processReminders();
      } catch (error) {
        logger.error("Error running notification cron:", error);
      }
    });
    logger.info("Notification cron service started.");
  }

  private async processReminders() {
    const now = dayjs();
    // Look for appointments starting exactly between 30 and 31 minutes from now
    const targetStart = now.add(30, "minute").toDate();
    const targetEnd = now.add(31, "minute").toDate();

    const appointments =
      await this.appointmentRepository.getAppointmentsStartingBetween(
        targetStart,
        targetEnd,
      );

    if (appointments.length === 0) return;

    for (const appt of appointments) {
      const appointmentTime = dayjs(appt.slot.start).format("DD MMM YYYY, hh:mm A");

      // Notify Patient
      if (appt.patientId && appt.patientEmail) {
        try {
          await this.emailService.sendAppointmentReminderEmail(
            appt.patientEmail,
            appt.patientName,
            appt.doctorName,
            appointmentTime,
            appt.slot.mode,
          );

          await this.createNotificationUseCase.execute({
            userId: appt.patientId.toString(),
            role: Roles.USER,
            title: "Appointment Reminder",
            message: `Your appointment with ${appt.doctorName} starts in 30 minutes.`,
            type: NotificationType.APPOINTMENT_REMINDER,
            referenceId: appt._id.toString(),
          });
        } catch (error) {
          logger.error(`Failed to notify patient ${appt.patientId}:`, error);
        }
      }

      // Notify Doctor
      if (appt.doctorId && appt.doctorEmail) {
        try {
          await this.createNotificationUseCase.execute({
            userId: appt.doctorId.toString(),
            role: Roles.DOCTOR,
            title: "Upcoming Consultation",
            message: `You have an appointment with ${appt.patientName} in 30 minutes.`,
            type: NotificationType.APPOINTMENT_REMINDER,
            referenceId: appt._id.toString(),
          });
        } catch (error) {
          logger.error(`Failed to notify doctor ${appt.doctorId}:`, error);
        }
      }
    }
  }
}
