export interface CreateConsultationReportInputDTO {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  chiefComplaint: string;
  clinicalNotes?: string;
  diagnosis: string;
  followUpDate?: Date | null;
  followUpNotes?: string;
}

export interface ConsultationReportDTO {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  chiefComplaint: string;
  clinicalNotes: string;
  diagnosis: string;
  followUpDate: string | null;
  followUpNotes: string;
  doctorName?: string;
  doctorSpecialization?: string;
  patientName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConsultationReportListFilterDTO {
  search?: string;
  specialization?: string;
  startDate?: string;
  endDate?: string;
  patientId?: string;
}

export interface PaginatedConsultationReportsDTO {
  reports: ConsultationReportDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
