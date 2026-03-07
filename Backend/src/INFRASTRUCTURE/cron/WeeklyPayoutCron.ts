import { ProcessDoctorPayoutsUseCase } from "../../application/usecases/payout/ProcessDoctorPayoutsUseCase";

export class WeeklyPayoutCron {
  constructor(
    private readonly processPayoutsUseCase: ProcessDoctorPayoutsUseCase,
    private readonly doctorService: any,
  ) {}

  // async run(): Promise<void> {
  //   console.log(`[WeeklyPayoutCron] Running at ${new Date().toISOString()}`);

  //   try {
  //     const eligibleDoctors = await this.doctorService.getAllVerifiedDoctors();

  //     for (const doctor of eligibleDoctors) {
  //       const result = await this.processPayoutsUseCase.execute(
  //         doctor.id
  //       );

  //       if (result.status === "SUCCESS") {
  //         console.log(
  //           `[WeeklyPayoutCron] Processed payout for doctor ${doctor.id}. Payout ID: ${result.payoutId}`,
  //         );
  //       } else if (result.status === "FAILED") {
  //         console.error(
  //           `[WeeklyPayoutCron] Failed payout for doctor ${doctor.id}: ${result.message}`,
  //         );
  //       }
  //     }
  //   } catch (error) {
  //     console.error(
  //       "[WeeklyPayoutCron] Critical failure during bulk payout processing",
  //       error,
  //     );
  //   }
  // }
}
