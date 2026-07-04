export interface PrescriptionMedicineDTO {
  medicine: string;
  dosage: string;
  frequency: string;
  timing: "Before Food" | "After Food";
  duration: string;
}

export interface CreatePrescriptionInputDTO {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  medicines: PrescriptionMedicineDTO[];
}

export interface PrescriptionDTO {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  medicines: PrescriptionMedicineDTO[];
  doctorName?: string;
  doctorSpecialization?: string;
  patientName?: string;
  doctorEmail?: string;
  doctorPhone?: string;
  doctorQualifications?: string;
  organizationName?: string;
  organizationAddress?: string;
  verificationToken?: string;
  prescriptionNumber?: string;
  status?: string;
  signatureKey?: string;
  signatureUrl?: string;
  consultationReportId?: string;
  createdAt: string;
  updatedAt: string;
}


export interface PrescriptionListFilterDTO {
  search?: string;
  specialization?: string;
  startDate?: string;
  endDate?: string;
  patientId?: string;
  doctorId?: string;
}

export interface PaginatedPrescriptionsDTO {
  prescriptions: PrescriptionDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
