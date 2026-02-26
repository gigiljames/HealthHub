import Appointment from "../../../domain/entities/appointment";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus";

export interface AppointmentFilterParams {
  search?: string;
  status?: string;
  mode?: string;
  timeRange?: string; // "today" | "week" | "month"
  sort?: "newest" | "oldest";
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
  createAppointment(data: any, session?: any): Promise<Appointment>;
  updateStatus(
    appointmentId: string,
    status: AppointmentStatus,
    session?: any,
  ): Promise<void>;
  findCompletableAppointmentsWithNoPayout(
    doctorId: string,
  ): Promise<Appointment[]>;
  findById(appointmentId: string): Promise<Appointment | null>;
  getAppointmentsForNoShow(cutoffDate: Date): Promise<Appointment[]>;
  updatePaymentId(
    appointmentId: string,
    paymentId: string,
    session?: any,
  ): Promise<void>;
  updatePayoutId(
    appointmentIds: string[],
    payoutId: string,
    session?: any,
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
  ): Promise<any | null>;

  // ─── Doctor ───────────────────────────────────────────────────
  getDoctorAppointments(
    doctorId: string,
    tab: string,
    filters: AppointmentFilterParams,
  ): Promise<PaginatedAppointments>;
  getDoctorAppointmentById(
    appointmentId: string,
    doctorId: string,
  ): Promise<any | null>;

  // ─── Admin ────────────────────────────────────────────────────
  getAllAppointments(
    tab: string,
    filters: AppointmentFilterParams,
  ): Promise<PaginatedAppointments>;
  getAdminAppointmentById(appointmentId: string): Promise<any | null>;
}
