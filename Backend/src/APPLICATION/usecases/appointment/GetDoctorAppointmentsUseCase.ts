import {
  IAppointmentRepository,
  AppointmentFilterParams,
  PaginatedAppointments,
} from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { IGetDoctorAppointmentsUsecase } from "../../../domain/interfaces/usecases/appointment/IGetDoctorAppointmentsUsecase";

export class GetDoctorAppointmentsUseCase implements IGetDoctorAppointmentsUsecase {
  constructor(private readonly appointmentRepository: IAppointmentRepository) {}

  async execute(
    doctorId: string,
    tab: string,
    filters: AppointmentFilterParams,
  ): Promise<PaginatedAppointments> {
    return this.appointmentRepository.getDoctorAppointments(
      doctorId,
      tab,
      filters,
    );
  }
}
