import { IPayoutRepository } from "../../domain/interfaces/repositories/IPayoutRepository";
import Payout from "../../domain/entities/payout";
import { payoutModel } from "../DB/models/payoutModel";
import { PayoutStatus } from "../../domain/enums/payoutStatus";

export class PayoutRepository implements IPayoutRepository {
  async createPayoutRecord(data: any, session?: any): Promise<Payout> {
    const [doc] = await payoutModel.create([data], { session });
    return this.mapToDomain(doc);
  }

  async markPayoutProcessed(payoutId: string): Promise<void> {
    await payoutModel.updateOne(
      { _id: payoutId },
      { $set: { status: PayoutStatus.PROCESSED } },
    );
  }

  async findById(payoutId: string): Promise<Payout | null> {
    const doc = await payoutModel.findById(payoutId);
    if (!doc) return null;
    return this.mapToDomain(doc);
  }

  private mapToDomain(doc: any): Payout {
    return new Payout({
      id: doc._id.toString(),
      doctorId: doc.doctorId.toString(),
      amount: doc.amount,
      currency: doc.currency,
      status: doc.status as PayoutStatus,
      gatewayRef: doc.gatewayRef || null,
      appointmentIds: doc.appointmentIds.map((id: any) => id.toString()),
    });
  }
}
