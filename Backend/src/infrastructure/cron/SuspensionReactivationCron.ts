import cron from "node-cron";
import { authModel } from "../DB/models/authModel";
import { DoctorProfileModel } from "../DB/models/doctorProfileModel";
import { EmailService } from "../../application/services/emailService";
import { logger } from "../../utils/logger";
import { Roles } from "../../domain/enums/roles";

export class SuspensionReactivationCron {
  private readonly _emailService: EmailService;

  constructor() {
    this._emailService = new EmailService();
  }

  start() {
    // Run daily at 12:05 AM (IST equivalent)
    cron.schedule("5 0 * * *", async () => {
      logger.info("Suspension cron job started execution...");
      try {
        const now = new Date();

        // 1. Handle reminders: ending tomorrow
        const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const endOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);

        const usersToRemind = await authModel.find({
          suspensionStatus: "suspended",
          suspensionEnd: { $gte: startOfTomorrow, $lt: endOfTomorrow },
        });

        for (const user of usersToRemind) {
          try {
            const endDateStr = user.suspensionEnd
              ? user.suspensionEnd.toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "";
            await this._emailService.sendSuspensionReminderEmail(user.email, user.name, user.role, endDateStr);
            logger.info(`Sent suspension end reminder email to: ${user.email}`);
          } catch (err) {
            logger.error(`Error sending suspension end reminder to ${user.email}`, err);
          }
        }

        // 2. Handle reactivations: ending today or earlier
        const usersToReactivate = await authModel.find({
          suspensionStatus: "suspended",
          suspensionEnd: { $lte: now },
        });

        for (const user of usersToReactivate) {
          try {
            user.isBlocked = false;
            user.suspensionStatus = "none";
            user.suspensionStart = null;
            user.suspensionEnd = null;
            user.suspensionReason = null;
            user.suspendedBy = null;
            await user.save();

            // If doctor, reactivate profile visibility
            if (user.role === Roles.DOCTOR) {
              const docProfile = await DoctorProfileModel.findOne({ doctorId: user._id });
              if (docProfile) {
                docProfile.isVisible = true;
                await docProfile.save();
              }
            }

            await this._emailService.sendAccountReactivatedEmail(user.email, user.name, user.role);
            logger.info(`Reactivated suspended account: ${user.email}`);
          } catch (err) {
            logger.error(`Error reactivating account ${user.email}`, err);
          }
        }
      } catch (error) {
        logger.error("Error in suspension cron job", error);
      }
    });

    logger.info("Suspension reactivation cron service started.");
  }
}
export const suspensionReactivationCron = new SuspensionReactivationCron();
