import {
  IAppointmentRepository,
  AppointmentFilterParams,
  PaginatedAppointments,
} from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { IGetAllAppointmentsUsecase } from "../../../domain/interfaces/usecases/appointment/IGetAllAppointmentsUsecase";

export class GetAllAppointmentsUseCase implements IGetAllAppointmentsUsecase {
  constructor(
    private readonly _appointmentRepository: IAppointmentRepository,
  ) {}

  async execute(
    tab: string,
    filters: AppointmentFilterParams,
  ): Promise<PaginatedAppointments> {
    return this._appointmentRepository.getAllAppointments(tab, filters);
  }
}
