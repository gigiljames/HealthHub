export interface IMarkAppointmentCompletedUsecase {
  execute(appointmentId: string, doctorId: string): Promise<void>;
}
