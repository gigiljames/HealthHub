import { Prescription } from "../../../domain/entities/prescription";

export interface IPrescriptionFilterParams {
  search?: string;
  specialization?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface IPaginatedPrescriptions {
  prescriptions: Prescription[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IPrescriptionRepository {
  create(data: Partial<Prescription>): Promise<Prescription>;
  findByAppointmentId(appointmentId: string): Promise<Prescription | null>;
  findById(id: string): Promise<Prescription | null>;
  findByVerificationToken(token: string): Promise<Prescription | null>;
  getPatientPrescriptions(

    patientId: string,
    page: number,
    limit: number,
    filters: IPrescriptionFilterParams,
  ): Promise<IPaginatedPrescriptions>;
  getDoctorPrescriptions(
    doctorId: string,
    page: number,
    limit: number,
    filters: IPrescriptionFilterParams,
  ): Promise<IPaginatedPrescriptions>;
  updateByAppointmentId(appointmentId: string, data: Partial<Prescription>): Promise<Prescription>;
}
