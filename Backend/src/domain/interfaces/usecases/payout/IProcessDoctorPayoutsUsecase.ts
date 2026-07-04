import { ProcessPayoutResponseDTO } from "../../../../application/DTOs/payout/payoutDTO";

export interface IProcessDoctorPayoutsUsecase {
  execute(
    doctorId: string,
    cutoffDate: Date,
  ): Promise<ProcessPayoutResponseDTO>;
}
