import Payment from "../../../domain/entities/payment";
import { PaymentStatus } from "../../../domain/enums/paymentStatus";

export interface IPaymentRepository {
  createPaymentRecord(data: any, session?: any): Promise<Payment>;
  updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    session?: any,
  ): Promise<void>;
  findById(paymentId: string): Promise<Payment | null>;
  findByGatewayRef(gatewayRef: string): Promise<Payment | null>;
}
