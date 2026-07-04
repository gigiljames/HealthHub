import cron from "node-cron";
import { IAppointmentRepository } from "../../domain/interfaces/repositories/IAppointmentRepository";
import { IEmailService } from "../../domain/interfaces/services/IEmailService";
import { ICreateNotificationUseCase } from "../../domain/interfaces/usecases/notification/ICreateNotificationUseCase";
import { IConsultationReportRepository } from "../../domain/interfaces/repositories/IConsultationReportRepository";
import { Roles } from "../../domain/enums/roles";
import { NotificationType } from "../../domain/enums/notificationType";
import { logger } from "../../utils/logger";
import dayjs from "dayjs";

export class NotificationCronService {
  constructor(
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly emailService: IEmailService,
    private readonly createNotificationUseCase: ICreateNotificationUseCase,
    private readonly consultationReportRepository: IConsultationReportRepository,
  ) {}

  start() {
    // Run every minute
    cron.schedule("* * * * *", async () => {
      try {
        await this.processReminders();
        await this.processFollowUpReminders();
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

  private async processFollowUpReminders() {
    try {
      const now = dayjs();
      const threeDaysFromNow = now.add(3, "day").endOf("day");

      const pendingReports =
        await this.consultationReportRepository.getPendingFollowUpNotifications(
          now.toDate(),
          threeDaysFromNow.toDate(),
        );

      if (pendingReports.length === 0) return;

      for (const report of pendingReports) {
        const followUpTime = dayjs(report.followUpDate).format("DD MMM YYYY");

        if (report.patientId && report.patientEmail) {
          try {
            // Email Notification
            await this.emailService.sendFollowUpReminderEmail(
              report.patientEmail,
              report.patientName,
              report.doctorName,
              followUpTime,
              report.followUpNotes ?? "",
            );

            // In-app Notification
            await this.createNotificationUseCase.execute({
              userId: report.patientId.toString(),
              role: Roles.USER,
              title: "Follow-up Consultation Reminder",
              message: `You have an upcoming follow-up consultation with Dr. ${report.doctorName} scheduled for ${followUpTime}.`,
              type: NotificationType.APPOINTMENT_REMINDER,
              referenceId: report._id.toString(),
            });

            // Mark notification as sent
            await this.consultationReportRepository.markFollowUpNotificationSent(
              report._id.toString(),
            );
          } catch (err) {
            logger.error(`Failed to notify patient for follow-up report ${report._id}:`, err);
          }
        }
      }
    } catch (error) {
      logger.error("Error processing follow-up reminders:", error);
    }
  }
}
