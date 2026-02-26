import Payout from "../../../domain/entities/payout";

export interface IPayoutRepository {
  createPayoutRecord(data: any, session?: any): Promise<Payout>;
  markPayoutProcessed(payoutId: string, gatewayRef: string): Promise<void>;
  findById(payoutId: string): Promise<Payout | null>;
}
