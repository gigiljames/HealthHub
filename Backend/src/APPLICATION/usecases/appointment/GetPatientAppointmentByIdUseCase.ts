import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { IGetPatientAppointmentByIdUsecase } from "../../../domain/interfaces/usecases/appointment/IGetPatientAppointmentByIdUsecase";
import { IS3Service } from "../../../domain/interfaces/services/IS3Service";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";

export class GetPatientAppointmentByIdUseCase implements IGetPatientAppointmentByIdUsecase {
  constructor(
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly s3Service: IS3Service,
  ) {}

  async execute(appointmentId: string, patientId: string): Promise<any | null> {
    const appointment =
      await this.appointmentRepository.getPatientAppointmentById(
        appointmentId,
        patientId,
      );
    if (!appointment) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        "Appointment not found.",
      );
    }
    if (appointment.doctor?.profileImageUrl) {
      appointment.doctor.profileImageUrl =
        await this.s3Service.getAccessSignedUrl(
          appointment.doctor.profileImageUrl,
        );
    }
    return appointment;
  }
}
