export interface TodayAppointment {
  id: string;
  status: string;
  start: string;
  end: string;
  patientName: string;
  dob: string | null;
  gender: string | null;
  bloodGroup: string | null;
  profileImageUrl: string | null;
  reason: string;
  mode: string;
}

export interface TodaySlot {
  id: string;
  start: string;
  end: string;
  isBooked: boolean;
}

export interface DoctorDaySchedule {
  totalAppointments: number;
  pendingAppointments: number;
  nextAppointment: string | null;
  appointments: TodayAppointment[];
  slots: TodaySlot[];
}
