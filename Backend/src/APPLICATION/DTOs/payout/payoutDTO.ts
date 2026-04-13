import { AppointmentStatus } from "../../../domain/enums/appointmentStatus";

export interface ProcessPayoutResponseDTO {
  status: "NO_PAYOUT_NEEDED" | "SUCCESS" | "FAILED";
  message?: string;
  payoutId?: string;
}

export interface PayoutAppointments {
  _id: string;
  patientId: string;
  doctorId: string;
  slotId: string;
  status: AppointmentStatus;
  reason: string;
  paymentId: string;
  payoutId: string;
  cancellationReason: string | null;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  patient: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface PayoutDetailsDTO {
  _id: string;
  amount: number;
  grossAmount: number;
  platformCommissions: number;
  currency: string;
  status: string;
  createdAt: Date;
  doctor: {
    id: string;
    name: string;
    email: string;
    phone: string;
    specialization: string;
  } | null;
  transaction: {
    id: string;
    amount: number;
    status: string;
    createdAt: Date;
  } | null;
  appointments: PayoutAppointments[];
}
