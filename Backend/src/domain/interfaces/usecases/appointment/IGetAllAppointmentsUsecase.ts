import {
  AppointmentFilterParams,
  PaginatedAppointments,
} from "../../../../domain/interfaces/repositories/IAppointmentRepository";

export interface IGetAllAppointmentsUsecase {
  execute(
    tab: string,
    filters: AppointmentFilterParams,
  ): Promise<PaginatedAppointments>;
}
