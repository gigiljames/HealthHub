import Dispute from "../../entities/dispute";
import { IBaseRepository } from "./IBaseRepository";

export interface DisputeFilterParams {
  search?: string;
  reporterRole?: string;
  reportedUserRole?: string;
  status?: string;
  timeRange?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface DisputeListItem {
  id: string;
  createdAt: Date;
  reporterId: string;
  reporterName: string;
  reporterRole: string;
  reportedUserId: string;
  reportedUserName: string;
  reportedUserRole: string;
  reason: string;
  status: string;
}

export interface PaginatedDisputes {
  disputes: DisputeListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IDisputeRepository extends IBaseRepository<Dispute> {
  save(dispute: Dispute): Promise<Dispute>;
  findByAppointmentAndReporter(
    appointmentId: string,
    reporterId: string,
  ): Promise<Dispute | null>;
  findByAppointmentId(appointmentId: string): Promise<Dispute[]>;
  findAllWithFilters(
    filters: DisputeFilterParams,
  ): Promise<PaginatedDisputes>;
}
