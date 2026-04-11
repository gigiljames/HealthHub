import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { IGetPatientAppointmentByIdUsecase } from "../../../domain/interfaces/usecases/appointment/IGetPatientAppointmentByIdUsecase";
import { IS3Service } from "../../../domain/interfaces/services/IS3Service";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";
import { PatientAppointmentDetailsDTO } from "../../DTOs/appointment/appointmentDTO";
import { AppointmentMapper } from "../../mappers/appointmentMapper";

export class GetPatientAppointmentByIdUseCase implements IGetPatientAppointmentByIdUsecase {
  constructor(
    private readonly _appointmentRepository: IAppointmentRepository,
    private readonly _s3Service: IS3Service,
  ) {}

  async execute(
    appointmentId: string,
    patientId: string,
  ): Promise<PatientAppointmentDetailsDTO | null> {
    const appointment =
      await this._appointmentRepository.getPatientAppointmentById(
        appointmentId,
        patientId,
      );
    if (!appointment) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.APPOINTMENT.NOT_FOUND,
      );
    }
    if (appointment.doctor?.profileImageUrl) {
      appointment.doctor.profileImageUrl =
        await this._s3Service.getAccessSignedUrl(
          appointment.doctor.profileImageUrl,
        );
    }
    return AppointmentMapper.toPatientAppointmentDetailsDTO(
      appointment,
      appointment.doctor?.profileImageUrl || null,
    );
  }
}
