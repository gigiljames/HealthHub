export interface RequestRescheduleDTO {
  appointmentId: string;
  doctorId: string;
  newSlotId: string;
  reason: string;
  customReason?: string;
}

export interface AcceptRescheduleDTO {
  appointmentId: string;
  patientId: string;
}

export interface DeclineRescheduleDTO {
  appointmentId: string;
  patientId: string;
}
