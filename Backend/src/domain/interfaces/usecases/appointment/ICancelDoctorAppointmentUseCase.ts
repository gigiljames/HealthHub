export interface ICancelDoctorAppointmentUseCase {
  execute(
    appointmentId: string,
    doctorId: string,
    reason: string,
  ): Promise<void>;
}
