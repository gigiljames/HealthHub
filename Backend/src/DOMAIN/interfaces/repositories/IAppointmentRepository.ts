import Appointment from "../../../domain/entities/appointment";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus";
import { DemographicRaw, AppointmentTrendRaw } from "./adminDashboardRepositoryTypes";
import {
  PatientAppointmentAggregateAgg,
  AdminAppointmentAggregateAgg,
  DoctorAppointmentAggregateAgg,
  DoctorAnalysisRawAgg,
  DoctorDayExecutionAppointmentAgg,
} from "../../../domain/types/repositoryTypes";

export interface AppointmentFilterParams {
  tab?: "ALL" | "UPCOMING" | "PAST" | "CANCELLED" | "COMPLETED";
  search?: string;
  status?: string;
  mode?: string;
  timeRange?: string; // "today" | "week" | "month"
  startDate?: string;
  endDate?: string;
  sort?: "newest" | "oldest" | string;
  paymentStatus?: string;
  doctorId?: string;
  patientId?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedAppointments {
  appointments: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IAppointmentRepository {
  createAppointment(
    data: Partial<Appointment>,
    session?: unknown,
  ): Promise<Appointment>;
  findActiveAppointmentBySlotId(slotId: string): Promise<Appointment | null>;
  updateStatus(
    appointmentId: string,
    status: AppointmentStatus,
    session?: unknown,
  ): Promise<void>;
  updateSlotAndStatus(
    appointmentId: string,
    slotId: string,
    status: AppointmentStatus,
    session?: unknown,
  ): Promise<void>;
  updateStatusAndReason(
    appointmentId: string,
    status: AppointmentStatus,
    reason: string,
    session?: unknown,
  ): Promise<void>;
  findCompletableAppointmentsWithNoPayout(
    doctorId: string,
  ): Promise<Appointment[]>;
  getEligibleAppointmentsForPayout(
    doctorId: string,
    cutoffDate: Date,
  ): Promise<Appointment[]>;
  findById(appointmentId: string): Promise<Appointment | null>;
  getAppointmentsForNoShow(cutoffDate: Date): Promise<Appointment[]>;
  getAppointmentsStartingBetween(
    startDate: Date,
    endDate: Date,
  ): Promise<any[]>; // Will return basic aggregated fields for emails
  updatePaymentId(
    appointmentId: string,
    paymentId: string,
    session?: unknown,
  ): Promise<void>;
  updatePayoutId(
    appointmentIds: string[],
    payoutId: string,
    session?: unknown,
  ): Promise<void>;
  updateRefundTransactionId(
    appointmentId: string,
    refundTransactionId: string,
    session?: unknown,
  ): Promise<void>;

  // ─── Patient ──────────────────────────────────────────────────
  getPatientAppointments(
    patientId: string,
    tab: string,
    filters: AppointmentFilterParams,
  ): Promise<PaginatedAppointments>;
  getPatientAppointmentById(
    appointmentId: string,
    patientId: string,
  ): Promise<PatientAppointmentAggregateAgg | null>;

  // ─── Doctor ───────────────────────────────────────────────────
  getDoctorAppointments(
    doctorId: string,
    tab: string,
    filters: AppointmentFilterParams,
  ): Promise<PaginatedAppointments>;
  getDoctorAppointmentById(
    appointmentId: string,
    doctorId: string,
  ): Promise<DoctorAppointmentAggregateAgg | null>;
  getDoctorDayExecutionAppointments(
    doctorId: string,
    startOfDay: Date,
    endOfDay: Date,
  ): Promise<DoctorDayExecutionAppointmentAgg[]>;

  getDoctorAnalysisData(
    doctorId: string,
    locationId: string | null,
    startDate: Date,
    endDate: Date,
    period: string,
  ): Promise<DoctorAnalysisRawAgg | null>;

  // ─── Admin ────────────────────────────────────────────────────
  getAllAppointments(
    tab: string,
    filters: AppointmentFilterParams,
  ): Promise<PaginatedAppointments>;
  getAdminAppointmentById(
    appointmentId: string,
  ): Promise<AdminAppointmentAggregateAgg | null>;

  getAppointmentStats(
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalBooked: number;
    totalCompleted: number;
    totalCancelled: number;
    totalNoShow: number;
    averageDuration: number;
  }>;
  getAppointmentTrends(
    startDate: Date,
    endDate: Date,
    period: string,
  ): Promise<AppointmentTrendRaw[]>;
  getModeDistribution(): Promise<DemographicRaw[]>;
}
