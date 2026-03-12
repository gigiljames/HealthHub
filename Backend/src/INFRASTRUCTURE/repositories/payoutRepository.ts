import { IPayoutRepository } from "../../domain/interfaces/repositories/IPayoutRepository";
import Payout from "../../domain/entities/payout";
import { payoutModel } from "../DB/models/payoutModel";
import { PayoutStatus } from "../../domain/enums/payoutStatus";

import { Types } from "mongoose";

export class PayoutRepository implements IPayoutRepository {
  async createPayoutRecord(data: any, session?: any): Promise<Payout> {
    const [doc] = await payoutModel.create([data], { session });
    return this.mapToDomain(doc);
  }

  async markPayoutProcessed(
    payoutId: string,
    transactionId?: string,
  ): Promise<void> {
    const updateData: any = { status: PayoutStatus.PROCESSED };
    if (transactionId) {
      updateData.transactionId = new Types.ObjectId(transactionId);
    }
    await payoutModel.updateOne({ _id: payoutId }, { $set: updateData });
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
      transactionId: doc.transactionId?.toString() || null,
      grossAmount: doc.grossAmount,
      platformCommissions: doc.platformCommissions,
      appointmentIds: doc.appointmentIds.map((id: any) => id.toString()),
    });
  }
}
