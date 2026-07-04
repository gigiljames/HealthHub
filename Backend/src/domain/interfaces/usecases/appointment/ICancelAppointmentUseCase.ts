export interface ICancelAppointmentUseCase {
  execute(appointmentId: string, patientId: string): Promise<void>;
}
