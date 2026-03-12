import { IPaymentRepository } from "../../domain/interfaces/repositories/IPaymentRepository";
import Payment from "../../domain/entities/payment";
import { paymentModel, IPaymentDocument } from "../DB/models/paymentModel";
import { PaymentStatus } from "../../domain/enums/paymentStatus";
import { BaseRepository } from "./base/BaseRepository";

export class PaymentRepository
  extends BaseRepository<IPaymentDocument>
  implements IPaymentRepository
{
  constructor() {
    super(paymentModel);
  }
  async createPaymentRecord(data: any, session?: any): Promise<Payment> {
    const [doc] = await paymentModel.create([data], { session });
    return this.mapToDomain(doc);
  }

  async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    session?: any,
  ): Promise<void> {
    await paymentModel.updateOne(
      { _id: paymentId },
      { $set: { status } },
      { session },
    );
  }

  async findById(paymentId: string): Promise<Payment | null> {
    const doc = await this.findDocumentById(paymentId);
    return doc ? this.mapToDomain(doc) : null;
  }

  async findByGatewayRef(gatewayRef: string): Promise<Payment | null> {
    const doc = await paymentModel.findOne({ gatewayRef });
    if (!doc) return null;
    return this.mapToDomain(doc);
  }

  private mapToDomain(doc: any): Payment {
    return new Payment({
      id: doc._id.toString(),
      amount: doc.amount,
      currency: doc.currency,
      appointmentId: doc.appointmentId.toString(),
      patientId: doc.patientId.toString(),
      status: doc.status as PaymentStatus,
      gatewayRef: doc.gatewayRef || null,
    });
  }
}
