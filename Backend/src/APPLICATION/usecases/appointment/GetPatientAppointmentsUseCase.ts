import {
  IAppointmentRepository,
  AppointmentFilterParams,
  PaginatedAppointments,
  IPatientAppointmentListItem,
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
      const patientItem = appointment as IPatientAppointmentListItem;
      if (patientItem.doctorProfile?.profileImageUrl) {
        patientItem.doctorProfile.profileImageUrl =
          await this._s3Service.getAccessSignedUrl(
            patientItem.doctorProfile.profileImageUrl,
          );
      }
    }
    return paginatedAppointments;
  }
}
