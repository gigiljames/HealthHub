export interface IGetPatientAppointmentByIdUsecase {
  execute(appointmentId: string, patientId: string): Promise<any | null>;
}
