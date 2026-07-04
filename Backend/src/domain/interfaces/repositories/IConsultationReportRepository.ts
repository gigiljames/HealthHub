import { ConsultationReport } from "../../../domain/entities/consultationReport";

export interface IConsultationReportFilterParams {
  search?: string;
  specialization?: string;
  startDate?: Date;
  endDate?: Date;
  doctorId?: string;
}

export interface IPaginatedConsultationReports {
  reports: ConsultationReport[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IFollowUpNotificationPending {
  _id: { toString(): string };
  patientId: { toString(): string };
  patientName: string;
  patientEmail: string;
  doctorName: string;
  followUpDate: Date;
  followUpNotes?: string;
}

export interface IConsultationReportRepository {
  create(data: Partial<ConsultationReport>): Promise<ConsultationReport>;
  findByAppointmentId(appointmentId: string): Promise<ConsultationReport | null>;
  findById(id: string): Promise<ConsultationReport | null>;
  getPatientReports(
    patientId: string,
    page: number,
    limit: number,
    filters: IConsultationReportFilterParams,
  ): Promise<IPaginatedConsultationReports>;
  getDoctorReports(
    doctorId: string,
    page: number,
    limit: number,
    filters: IConsultationReportFilterParams,
  ): Promise<IPaginatedConsultationReports>;
  updateByAppointmentId(appointmentId: string, data: Partial<ConsultationReport>): Promise<ConsultationReport>;
  getPendingFollowUpNotifications(now: Date, threeDaysFromNow: Date): Promise<IFollowUpNotificationPending[]>;
  markFollowUpNotificationSent(reportId: string): Promise<void>;
}
