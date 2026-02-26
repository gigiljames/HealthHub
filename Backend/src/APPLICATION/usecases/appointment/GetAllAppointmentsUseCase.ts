import {
  IAppointmentRepository,
  AppointmentFilterParams,
  PaginatedAppointments,
} from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { IGetAllAppointmentsUsecase } from "../../../domain/interfaces/usecases/appointment/IGetAllAppointmentsUsecase";

export class GetAllAppointmentsUseCase implements IGetAllAppointmentsUsecase {
  constructor(private readonly appointmentRepository: IAppointmentRepository) {}

  async execute(
    tab: string,
    filters: AppointmentFilterParams,
  ): Promise<PaginatedAppointments> {
    return this.appointmentRepository.getAllAppointments(tab, filters);
  }
}
