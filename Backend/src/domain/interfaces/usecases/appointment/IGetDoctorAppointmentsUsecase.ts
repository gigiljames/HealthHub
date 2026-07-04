import {
  AppointmentFilterParams,
  PaginatedAppointments,
} from "../../../../domain/interfaces/repositories/IAppointmentRepository";

export interface IGetDoctorAppointmentsUsecase {
  execute(
    doctorId: string,
    tab: string,
    filters: AppointmentFilterParams,
  ): Promise<PaginatedAppointments>;
}
