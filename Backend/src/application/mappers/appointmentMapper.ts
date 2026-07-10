import Transaction from "../../domain/entities/transaction";
import {
  AdminAppointmentDetailsDTO,
  DoctorAppointmentDetailsDTO,
  PatientAppointmentDetailsDTO,
} from "../DTOs/appointment/appointmentDTO";

export interface PatientAppointmentAggregate {
  _id: string;
  status: string;
  reason?: string;
  doctor: {
    id: string;
    name: string;
    specialization: string;
    profileImageUrl?: string | null;
    contactPhone: string;
  };
  slot: {
    start: Date;
    consultationMode: string;
    consultationFee: number;
    consultationModes?: string[];
  };
  payment: {
    amount: number;
    status: string;
  } | null;
  refund?: {
    id: string;
    amount: number;
    status: string;
    createdAt: Date;
  };
  cancellationReason?: string | null;
  platformFee?: number;
  consultationFee?: number;
  rescheduleRequest?: {
    id: string;
    newSlotId: string;
    oldSlotId?: string | null;
    newStart: Date;
    newEnd: Date;
    oldStart?: Date | null;
    oldEnd?: Date | null;
    reason: string;
    customReason: string | null;
    status: string;
  } | null;
}

export interface DoctorAppointmentAggregate {
  id: string;
  patientId?: string;
  start: Date;
  end: Date;
  locationName: string;
  location: string | object;
  practiceLocationId?: string;
  mode: string;
  status: string;
  payment: Transaction | null;
  refund?: {
    id: string;
    amount: number;
    status: string;
    createdAt: Date;
  };
  patientName: string;
  dob?: Date;
  gender?: string;
  consultationModes?: string[];
  cancellationReason?: string | null;
  platformFee?: number;
  consultationFee?: number;
  rescheduleRequest?: {
    id: string;
    newSlotId: string;
    oldSlotId?: string | null;
    newStart: Date;
    newEnd: Date;
    oldStart?: Date | null;
    oldEnd?: Date | null;
    reason: string;
    customReason: string | null;
    status: string;
  } | null;
}

export interface AdminAppointmentAggregate {
  _id: string;
  status: string;
  reason?: string;
  createdAt: Date;
  patientFields: {
    id: string;
    name: string;
    email: string;
    profileImageUrl: string | null;
  };
  doctorFields: {
    id: string;
    name: string;
    email: string;
    profileImageUrl: string | null;
  };
  slot: {
    start: Date;
    end: Date;
    consultationMode: string;
    consultationFee?: number;
    locationName?: string;
    location?: string;
  };
  payment: {
    amount: number;
    status: string;
  } | null;
  allTransactions: Transaction[];
  cancellationReason?: string | null;
  platformFee?: number;
  consultationFee?: number;
}

export class AppointmentMapper {
  static toPatientAppointmentDetailsDTO(
    appointment: PatientAppointmentAggregate,
    profileImageUrl: string | null,
  ): PatientAppointmentDetailsDTO {
    return {
      _id: appointment._id.toString(),
      status: appointment.status,
      reason: appointment.reason,
      doctor: {
        id: appointment.doctor.id,
        name: appointment.doctor.name,
        specialization: appointment.doctor.specialization,
        profileImageUrl: profileImageUrl || null,
        contactPhone: appointment.doctor.contactPhone,
      },
      slot: {
        start: appointment.slot.start,
        consultationMode: appointment.slot.consultationMode,
        consultationFee: appointment.slot.consultationFee,
        supportedModes: appointment.slot.consultationModes,
      },
      payment: appointment.payment
        ? {
          amount: appointment.payment.amount,
          status: appointment.payment.status,
        }
        : null,
      refund: appointment.refund && appointment.refund.id
        ? {
          id: appointment.refund.id.toString(),
          amount: appointment.refund.amount,
          status: appointment.refund.status,
          createdAt: appointment.refund.createdAt ? appointment.refund.createdAt.toISOString() : "",
        }
        : null,
      cancellationReason: appointment.cancellationReason || null,
      platformFee: appointment.platformFee || 0,
      consultationFee: appointment.consultationFee || appointment.slot.consultationFee || 0,
      rescheduleRequest: appointment.rescheduleRequest
        ? {
          id: appointment.rescheduleRequest.id,
          newSlotId: appointment.rescheduleRequest.newSlotId,
          oldSlotId: appointment.rescheduleRequest.oldSlotId,
          newStart: appointment.rescheduleRequest.newStart,
          newEnd: appointment.rescheduleRequest.newEnd,
          oldStart: appointment.rescheduleRequest.oldStart,
          oldEnd: appointment.rescheduleRequest.oldEnd,
          reason: appointment.rescheduleRequest.reason,
          customReason: appointment.rescheduleRequest.customReason,
          status: appointment.rescheduleRequest.status,
        }
        : null,
    };
  }

  static toDoctorAppointmentDetailsDTO(
    appointment: DoctorAppointmentAggregate,
  ): DoctorAppointmentDetailsDTO {
    return {
      ...appointment,
      id: appointment.id.toString(),
      patientId: appointment.patientId?.toString(),
      supportedModes: appointment.consultationModes,
      refund: appointment.refund && appointment.refund.id
        ? {
          id: appointment.refund.id.toString(),
          amount: appointment.refund.amount,
          status: appointment.refund.status,
          createdAt: appointment.refund.createdAt ? appointment.refund.createdAt.toISOString() : "",
        }
        : null,
      cancellationReason: appointment.cancellationReason || null,
      platformFee: appointment.platformFee || 0,
      consultationFee: appointment.consultationFee || 0,
    };
  }

  static toAdminAppointmentDetailsDTO(
    appointment: AdminAppointmentAggregate,
    doctorProfileImageUrl: string | null,
    patientProfileImageUrl: string | null,
  ): AdminAppointmentDetailsDTO {
    return {
      ...appointment,
      _id: appointment._id.toString(),
      id: appointment._id.toString(),
      patientFields: {
        ...appointment.patientFields,
        id: appointment.patientFields.id?.toString(),
        profileImageUrl: patientProfileImageUrl,
      },
      doctorFields: {
        ...appointment.doctorFields,
        id: appointment.doctorFields.id?.toString(),
        profileImageUrl: doctorProfileImageUrl,
      },
      allTransactions: appointment.allTransactions.map((tx: any) => ({
        ...tx,
        _id: tx._id.toString(),
        userId: tx.userId?.toString(),
        appointmentId: tx.appointmentId?.toString(),
      })),
      cancellationReason: appointment.cancellationReason || null,
      platformFee: appointment.platformFee || 0,
      consultationFee: appointment.consultationFee || appointment.slot.consultationFee || 0,
    };
  }
}
