import { AppointmentStatus } from "../../../domain/enums/appointmentStatus";

export interface TodayAppointmentDTO {
  id: string;
  status: AppointmentStatus;
  start: Date;
  end: Date;
  patientName: string;
  dob: Date | null;
  gender: string | null;
  bloodGroup: string | null;
  profileImageUrl: string | null;
  reason: string;
  mode: string;
}

export interface TodaySlotDTO {
  id: string;
  start: Date;
  end: Date;
  isBooked: boolean;
}

export interface DoctorDayScheduleDTO {
  totalAppointments: number;
  pendingAppointments: number;
  nextAppointment: Date | null;
  appointments: TodayAppointmentDTO[];
  slots: TodaySlotDTO[];
}
