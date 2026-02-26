import {
  IAppointmentRepository,
  AppointmentFilterParams,
  PaginatedAppointments,
} from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { IGetPatientAppointmentsUsecase } from "../../../domain/interfaces/usecases/appointment/IGetPatientAppointmentsUsecase";

export class GetPatientAppointmentsUseCase implements IGetPatientAppointmentsUsecase {
  constructor(private readonly appointmentRepository: IAppointmentRepository) {}

  async execute(
    patientId: string,
    tab: string,
    filters: AppointmentFilterParams,
  ): Promise<PaginatedAppointments> {
    return this.appointmentRepository.getPatientAppointments(
      patientId,
      tab,
      filters,
    );
  }
}
