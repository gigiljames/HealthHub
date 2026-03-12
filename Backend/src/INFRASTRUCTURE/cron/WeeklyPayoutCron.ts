import cron from "node-cron";
import { ProcessDoctorPayoutsUseCase } from "../../application/usecases/payout/ProcessDoctorPayoutsUseCase";
import { authModel } from "../DB/models/authModel";
import { Roles } from "../../domain/enums/roles";

export class WeeklyPayoutCron {
  constructor(
    private readonly processPayoutsUseCase: ProcessDoctorPayoutsUseCase,
  ) {}

  public start() {
    cron.schedule("0 23 * * 6", () => {
      this.run();
    });
    console.log(
      "[WeeklyPayoutCron] Scheduled to run every Saturday at 11:00 PM.",
    );
  }

  async run(): Promise<void> {
    console.log(`[WeeklyPayoutCron] Running at ${new Date().toISOString()}`);

    try {
      const eligibleDoctors = await authModel.find({
        role: Roles.DOCTOR,
        isVerified: true,
      });

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 3);

      for (const doctor of eligibleDoctors) {
        const result = await this.processPayoutsUseCase.execute(
          doctor._id.toString(),
          cutoffDate,
        );

        if (result.status === "SUCCESS") {
          console.log(
            `[WeeklyPayoutCron] Processed payout for doctor ${doctor._id.toString()}. Payout ID: ${result.payoutId}`,
          );
        } else if (result.status === "FAILED") {
          console.error(
            `[WeeklyPayoutCron] Failed payout for doctor ${doctor._id.toString()}: ${result.message}`,
          );
        }
      }
    } catch (error) {
      console.error(
        "[WeeklyPayoutCron] Critical failure during bulk payout processing",
        error,
      );
    }
  }
}
