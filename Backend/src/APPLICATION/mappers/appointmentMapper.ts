import {
  AdminAppointmentDetailsDTO,
  DoctorAppointmentDetailsDTO,
  PatientAppointmentDetailsDTO,
} from "../DTOs/appointment/appointmentDTO";

export interface PatientAppointmentAggregate {
  _id: any;
  status: string;
  reason?: string;
  doctor: {
    name: string;
    specialization: string;
    profileImageUrl?: string | null;
    contactPhone: string;
  };
  slot: {
    start: Date;
    consultationMode: string;
    consultationFee: number;
  };
  payment: {
    amount: number;
    status: string;
  } | null;
}

export interface DoctorAppointmentAggregate {
  id: any;
  start: Date;
  end: Date;
  locationName: string;
  location: string;
  mode: string;
  status: string;
  payment: any | null;
  patientName: string;
  dob?: Date;
  gender?: string;
}

export interface AdminAppointmentAggregate {
  _id: any;
  status: string;
  reason?: string;
  createdAt: Date;
  patientFields: {
    id: any;
    name: string;
    email: string;
    profileImageUrl: string | null;
  };
  doctorFields: {
    id: any;
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
  allTransactions: any[];
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
        name: appointment.doctor.name,
        specialization: appointment.doctor.specialization,
        profileImageUrl: profileImageUrl || null,
        contactPhone: appointment.doctor.contactPhone,
      },
      slot: {
        start: appointment.slot.start,
        consultationMode: appointment.slot.consultationMode,
        consultationFee: appointment.slot.consultationFee,
      },
      payment: appointment.payment
        ? {
            amount: appointment.payment.amount,
            status: appointment.payment.status,
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
    };
  }
}
