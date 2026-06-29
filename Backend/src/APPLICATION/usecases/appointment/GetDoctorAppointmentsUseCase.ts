import {
  IAppointmentRepository,
  AppointmentFilterParams,
  PaginatedAppointments,
  IDoctorAppointmentListItem,
} from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { IS3Service } from "../../../domain/interfaces/services/IS3Service";
import { IGetDoctorAppointmentsUsecase } from "../../../domain/interfaces/usecases/appointment/IGetDoctorAppointmentsUsecase";

export class GetDoctorAppointmentsUseCase implements IGetDoctorAppointmentsUsecase {
  constructor(
    private readonly _appointmentRepository: IAppointmentRepository,
    private readonly _s3Service: IS3Service,
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
    for (const appointment of paginatedAppointments.appointments) {
      const doctorItem = appointment as IDoctorAppointmentListItem;
      if (doctorItem.userProfile?.profileImageUrl) {
        doctorItem.userProfile.profileImageUrl =
          await this._s3Service.getAccessSignedUrl(
            doctorItem.userProfile.profileImageUrl,
          );
      }
    }
    return paginatedAppointments;
  }
}
