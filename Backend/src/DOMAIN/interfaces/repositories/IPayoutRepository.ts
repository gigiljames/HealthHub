import Payout from "../../../domain/entities/payout";

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
  payouts: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IPayoutRepository {
  createPayoutRecord(data: any, session?: any): Promise<Payout>;
  markPayoutProcessed(payoutId: string, transactionId?: string): Promise<void>;
  findById(payoutId: string): Promise<Payout | null>;

  getDoctorPayouts(
    doctorId: string,
    filters: PayoutFilterParams,
  ): Promise<PaginatedPayouts>;
  getAdminPayouts(filters: PayoutFilterParams): Promise<PaginatedPayouts>;
  getPayoutDetails(payoutId: string): Promise<any>;
}
