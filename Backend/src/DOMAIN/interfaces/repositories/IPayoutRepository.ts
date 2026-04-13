import Payout from "../../../domain/entities/payout";
import { PayoutAggregateDetailsAgg } from "../../../domain/types/repositoryTypes";

export interface PayoutFilterParams {
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  specialization?: string;
  sortBy?: string; // 'amount', 'date', 'appointments'
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface PaginatedPayouts {
  payouts: PayoutAggregateDetailsAgg[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IPayoutRepository {
  createPayoutRecord(data: Partial<Payout>, session?: unknown): Promise<Payout>;
  markPayoutProcessed(
    payoutId: string,
    transactionId?: string,
    session?: unknown,
  ): Promise<void>;
  findById(payoutId: string): Promise<Payout | null>;

  getDoctorPayouts(
    doctorId: string,
    filters: PayoutFilterParams,
  ): Promise<PaginatedPayouts>;
  getAdminPayouts(filters: PayoutFilterParams): Promise<PaginatedPayouts>;
  getPayoutDetails(payoutId: string): Promise<PayoutAggregateDetailsAgg | null>;
}
