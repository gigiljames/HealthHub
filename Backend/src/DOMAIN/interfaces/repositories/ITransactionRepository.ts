import Transaction from "../../entities/transaction";
import { PaymentStatus } from "../../enums/paymentStatus";
import { TransactionDirection } from "../../enums/transactionDirection";
import { TransactionType } from "../../enums/transactionType";
import { TransactionSource } from "../../enums/transactionSource";

export interface TransactionFilterParams {
  search?: string;
  source?: TransactionSource;
  type?: TransactionType;
  direction?: TransactionDirection;
  status?: PaymentStatus;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedTransactions {
  transactions: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ITransactionRepository {
  createTransaction(data: any, session?: any): Promise<Transaction>;

  updateStatus(
    transactionId: string,
    status: PaymentStatus,
    session?: any,
  ): Promise<void>;

  findById(transactionId: string): Promise<Transaction | null>;

  findByGatewayRef(gatewayRef: string): Promise<Transaction | null>;

  findByAppointmentId(appointmentId: string): Promise<Transaction | null>;

  getTransactionsByUserId(
    userId: string,
    filters: TransactionFilterParams,
  ): Promise<PaginatedTransactions>;

  getTransactionsByDoctorId(
    doctorId: string,
    filters: TransactionFilterParams,
  ): Promise<PaginatedTransactions>;

  getAllTransactions(
    filters: TransactionFilterParams,
  ): Promise<PaginatedTransactions>;
}
