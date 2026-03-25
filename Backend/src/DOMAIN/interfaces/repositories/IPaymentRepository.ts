import Payment from "../../../domain/entities/payment";
import { PaymentStatus } from "../../../domain/enums/paymentStatus";

export interface IPaymentRepository {
  createPaymentRecord(
    data: Partial<Payment>,
    session?: unknown,
  ): Promise<Payment>;
  updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    session?: unknown,
  ): Promise<void>;
  findById(paymentId: string): Promise<Payment | null>;
  findByGatewayRef(gatewayRef: string): Promise<Payment | null>;
}
