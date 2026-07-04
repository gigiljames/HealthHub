import {
  AppointmentFilterParams,
  PaginatedAppointments,
} from "../../../../domain/interfaces/repositories/IAppointmentRepository";

export interface IGetPatientAppointmentsUsecase {
  execute(
    patientId: string,
    tab: string,
    filters: AppointmentFilterParams,
  ): Promise<PaginatedAppointments>;
}
