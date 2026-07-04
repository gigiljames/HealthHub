import cron from "node-cron";
import { DoctorProfileModel } from "../DB/models/doctorProfileModel";
import { VerificationStatus } from "../../domain/enums/verificationStatus";
import { IProcessDoctorPayoutsUsecase } from "../../domain/interfaces/usecases/payout/IProcessDoctorPayoutsUsecase";

export class WeeklyPayoutCron {
  constructor(
    private readonly _processPayoutsUseCase: IProcessDoctorPayoutsUsecase,
  ) { }

  public start() {
    const rule = "0 23 * * 6";
    // const rule = "* * * * *";
    cron.schedule(rule, () => {
      this.run();
    });
    console.log(
      "[WeeklyPayoutCron] Scheduled to run every Saturday at 11:00 PM.",
    );
  }

  async run(): Promise<void> {
    console.log(`[WeeklyPayoutCron] Running at ${new Date().toISOString()}`);

    try {
      const eligibleProfiles = await DoctorProfileModel.find({
        verificationStatus: VerificationStatus.verified,
      }).select("doctorId");

      const cutoffDate = new Date();
      // 3 days buffer for dispute management
      cutoffDate.setDate(cutoffDate.getDate() - 3);

      for (const profile of eligibleProfiles) {
        const result = await this._processPayoutsUseCase.execute(
          profile.doctorId.toString(),
          cutoffDate,
        );

        if (result.status === "SUCCESS") {
          console.log(
            `[WeeklyPayoutCron] Processed payout for doctor ${profile.doctorId.toString()}. Payout ID: ${result.payoutId}`,
          );
        } else if (result.status === "FAILED") {
          console.error(
            `[WeeklyPayoutCron] Failed payout for doctor ${profile.doctorId.toString()}: ${result.message}`,
          );
        } else if (result.status === "NO_PAYOUT_NEEDED") {
          console.log(
            `[WeeklyPayoutCron] No payout needed for doctor ${profile.doctorId.toString()}: ${result.message}`,
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
