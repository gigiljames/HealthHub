import Transaction from "../../entities/transaction";
import { PaymentStatus } from "../../enums/paymentStatus";
import { TransactionDirection } from "../../enums/transactionDirection";
import { TransactionType } from "../../enums/transactionType";
import { TransactionSource } from "../../enums/transactionSource";
import { TransactionWithUserAgg } from "../../../domain/types/repositoryTypes";

export interface TransactionFilterParams {
  search?: string;
  source?: TransactionSource;
  type?: TransactionType;
  direction?: TransactionDirection;
  status?: PaymentStatus;
  role?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedTransactions {
  transactions: TransactionWithUserAgg[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ITransactionRepository {
  createTransaction(
    data: Partial<Transaction>,
    session?: unknown,
  ): Promise<Transaction>;

  updateStatus(
    transactionId: string,
    status: PaymentStatus,
    session?: unknown,
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

  getWalletTransactions(
    walletId: string,
    filters: TransactionFilterParams,
  ): Promise<PaginatedTransactions>;

  getTransactionDetails(
    transactionId: string,
  ): Promise<TransactionWithUserAgg | null>;
}
