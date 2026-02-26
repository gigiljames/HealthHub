export interface IGetAdminAppointmentByIdUsecase {
  execute(appointmentId: string): Promise<any | null>;
}
