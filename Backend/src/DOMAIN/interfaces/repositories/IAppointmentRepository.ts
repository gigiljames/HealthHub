import Appointment from "../../../domain/entities/appointment";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus";
import {
  PatientAppointmentAggregateAgg,
  AdminAppointmentAggregateAgg,
  DoctorAppointmentAggregateAgg,
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
  updateStatus(
    appointmentId: string,
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

  // ─── Admin ────────────────────────────────────────────────────
  getAllAppointments(
    tab: string,
    filters: AppointmentFilterParams,
  ): Promise<PaginatedAppointments>;
  getAdminAppointmentById(
    appointmentId: string,
  ): Promise<AdminAppointmentAggregateAgg | null>;
}
