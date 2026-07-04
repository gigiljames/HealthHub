import { PayoutDetailsDTO } from "../../../../application/DTOs/payout/payoutDTO";

export interface IGetPayoutDetailsUseCase {
  execute(payoutId: string): Promise<PayoutDetailsDTO>;
}
