import api from "./axios";
import { ROUTES } from "../constants/routes";

export const joinConsultation = async (appointmentId: string) => {
  const response = await api.post(ROUTES.CONSULTATION.JOIN_CONSULTATION, {
    appointmentId,
  });
  return response.data;
};

export const endConsultation = async (appointmentId: string) => {
  const response = await api.post(ROUTES.CONSULTATION.END_CONSULTATION, {
    appointmentId,
  });
  return response.data;
};

export const createConsultationReport = async (reportData: {
  appointmentId: string;
  chiefComplaint: string;
  clinicalNotes?: string;
  diagnosis: string;
  followUpDate?: string | null;
  followUpNotes?: string;
}) => {
  const response = await api.post(ROUTES.CONSULTATION.CREATE_REPORT, reportData);
  return response.data;
};

export const getConsultationReportByAppointmentId = async (appointmentId: string) => {
  const response = await api.get(
    ROUTES.CONSULTATION.GET_REPORT_BY_APPOINTMENT_ID.replace(":appointmentId", appointmentId)
  );
  return response.data;
};

export const getConsultationReportById = async (id: string) => {
  const response = await api.get(ROUTES.CONSULTATION.GET_REPORT_BY_ID.replace(":id", id));
  return response.data;
};

export const listConsultationReports = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  specialization?: string;
  startDate?: string;
  endDate?: string;
  patientId?: string;
}) => {
  const response = await api.get(ROUTES.CONSULTATION.LIST_REPORTS, { params });
  return response.data;
};

export const createPrescription = async (prescriptionData: {
  appointmentId: string;
  medicines: Array<{
    medicine: string;
    dosage: string;
    frequency: string;
    timing: "Before Food" | "After Food";
    duration: string;
  }>;
}) => {
  const response = await api.post(ROUTES.CONSULTATION.CREATE_PRESCRIPTION, prescriptionData);
  return response.data;
};

export const getPrescriptionByAppointmentId = async (appointmentId: string) => {
  const response = await api.get(
    ROUTES.CONSULTATION.GET_PRESCRIPTION_BY_APPOINTMENT_ID?.replace(":appointmentId", appointmentId) ||
    `/consultations/prescriptions/appointment/${appointmentId}`
  );
  return response.data;
};

export const getPrescriptionById = async (id: string) => {
  const response = await api.get(
    ROUTES.CONSULTATION.GET_PRESCRIPTION_BY_ID?.replace(":id", id) ||
    `/consultations/prescriptions/${id}`
  );
  return response.data;
};

export const listPrescriptions = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  specialization?: string;
  startDate?: string;
  endDate?: string;
  patientId?: string;
  appointmentId?: string;
}) => {
  const response = await api.get(ROUTES.CONSULTATION.LIST_PRESCRIPTIONS, { params });
  return response.data;
};

export const revokePrescription = async (id: string) => {
  const response = await api.post(
    ROUTES.CONSULTATION.REVOKE_PRESCRIPTION.replace(":id", id)
  );
  return response.data;
};

export const verifyPrescription = async (verificationToken: string) => {
  const response = await api.get(
    ROUTES.CONSULTATION.VERIFY_PRESCRIPTION.replace(":verificationToken", verificationToken)
  );
  return response.data;
};
