import Appointment from "../../domain/entities/appointment";
import Auth from "../../domain/entities/auth";
import { AppointmentStatus } from "../../domain/enums/appointmentStatus";
import {
  PayoutAppointments,
  PayoutDetailsDTO,
  ProcessPayoutResponseDTO,
} from "../DTOs/payout/payoutDTO";

export interface PayoutAggregateDetails {
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
  appointments: Array<{
    _id: string;
    doctorId: string;
    patientId: string;
    slotId: string;
    status: AppointmentStatus;
    reason: string;
    paymentId: string;
    payoutId: string;
    cancellationReason: string;
    createdAt: string;
    updatedAt: string;
    patient: {
      _id: string;
      name: string;
      email: string;
    };
  }>;
}

export class PayoutMapper {
  static toPayoutDetailsDTO(
    payoutDetails: PayoutAggregateDetails,
  ): PayoutDetailsDTO {
    return {
      _id: payoutDetails._id.toString(),
      amount: payoutDetails.amount,
      grossAmount: payoutDetails.grossAmount,
      platformCommissions: payoutDetails.platformCommissions,
      currency: payoutDetails.currency,
      status: payoutDetails.status,
      createdAt: payoutDetails.createdAt,
      doctor: payoutDetails.doctor
        ? {
            id: payoutDetails.doctor.id.toString(),
            name: payoutDetails.doctor.name,
            email: payoutDetails.doctor.email,
            phone: payoutDetails.doctor.phone,
            specialization: payoutDetails.doctor.specialization,
          }
        : null,
      transaction: payoutDetails.transaction
        ? {
            id: payoutDetails.transaction.id.toString(),
            amount: payoutDetails.transaction.amount,
            status: payoutDetails.transaction.status,
            createdAt: payoutDetails.transaction.createdAt,
          }
        : null,
      appointments: payoutDetails.appointments.map(
        (apt: PayoutAppointments) => ({
          ...apt,
          _id: apt._id.toString(),
          doctorId: apt.doctorId.toString(),
          patientId: apt.patientId.toString(),
          slotId: apt.slotId.toString(),
          patient: {
            ...apt.patient,
            _id: apt.patient._id.toString(),
          },
        }),
      ),
    };
  }

  static toProcessPayoutResponseDTO(
    status: "NO_PAYOUT_NEEDED" | "SUCCESS" | "FAILED",
    message?: string,
    payoutId?: string,
  ): ProcessPayoutResponseDTO {
    return {
      status,
      message,
      payoutId,
    };
  }
}
