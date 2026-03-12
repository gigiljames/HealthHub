import {
  IAppointmentRepository,
  AppointmentFilterParams,
  PaginatedAppointments,
} from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { IS3Service } from "../../../domain/interfaces/services/IS3Service";
import { IGetDoctorAppointmentsUsecase } from "../../../domain/interfaces/usecases/appointment/IGetDoctorAppointmentsUsecase";

export class GetDoctorAppointmentsUseCase implements IGetDoctorAppointmentsUsecase {
  constructor(
    private _appointmentRepository: IAppointmentRepository,
    private _s3Service: IS3Service,
  ) {}

  async execute(
    doctorId: string,
    tab: string,
    filters: AppointmentFilterParams,
  ): Promise<PaginatedAppointments> {
    const paginatedAppointments =
      await this._appointmentRepository.getDoctorAppointments(
        doctorId,
        tab,
        filters,
      );
    for (let appointment of paginatedAppointments.appointments) {
      if (appointment.userProfile?.profileImageUrl) {
        appointment.userProfile.profileImageUrl =
          await this._s3Service.getAccessSignedUrl(
            appointment.userProfile.profileImageUrl,
          );
      }
    }
    return paginatedAppointments;
  }
}
