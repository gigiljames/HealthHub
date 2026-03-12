import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { IGetAdminAppointmentByIdUsecase } from "../../../domain/interfaces/usecases/appointment/IGetAdminAppointmentByIdUsecase";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { IS3Service } from "../../../domain/interfaces/services/IS3Service";

export class GetAdminAppointmentByIdUseCase implements IGetAdminAppointmentByIdUsecase {
  constructor(
    private _appointmentRepository: IAppointmentRepository,
    private _s3Service: IS3Service,
  ) {}

  async execute(appointmentId: string): Promise<any | null> {
    const appointment =
      await this._appointmentRepository.getAdminAppointmentById(appointmentId);
    if (!appointment) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        "Appointment not found.",
      );
    }
    if (appointment.doctorFields?.profileImageUrl) {
      appointment.doctorFields.profileImageUrl =
        await this._s3Service.getAccessSignedUrl(
          appointment.doctorFields?.profileImageUrl,
        );
    }
    if (appointment.patientFields?.profileImageUrl) {
      appointment.patientFields.profileImageUrl =
        await this._s3Service.getAccessSignedUrl(
          appointment.patientFields?.profileImageUrl,
        );
    }
    return appointment;
  }
}
