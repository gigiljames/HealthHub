import {
  IAppointmentRepository,
  AppointmentFilterParams,
  PaginatedAppointments,
} from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { IGetPatientAppointmentsUsecase } from "../../../domain/interfaces/usecases/appointment/IGetPatientAppointmentsUsecase";
import { IS3Service } from "../../../domain/interfaces/services/IS3Service";

export class GetPatientAppointmentsUseCase implements IGetPatientAppointmentsUsecase {
  constructor(
    private readonly _appointmentRepository: IAppointmentRepository,
    private readonly _s3Service: IS3Service,
  ) {}

  async execute(
    patientId: string,
    tab: string,
    filters: AppointmentFilterParams,
  ): Promise<PaginatedAppointments> {
    const paginatedAppointments =
      await this._appointmentRepository.getPatientAppointments(
        patientId,
        tab,
        filters,
      );
    for (const appointment of paginatedAppointments.appointments) {
      if (appointment.doctorProfile.profileImageUrl) {
        appointment.doctorProfile.profileImageUrl =
          await this._s3Service.getAccessSignedUrl(
            appointment.doctorProfile.profileImageUrl,
          );
      }
    }
    return paginatedAppointments;
  }
}
