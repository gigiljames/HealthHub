export interface IGetDoctorAppointmentByIdUsecase {
  execute(appointmentId: string, doctorId: string): Promise<any | null>;
}
