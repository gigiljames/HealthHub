import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { IGetDoctorAppointmentByIdUsecase } from "../../../domain/interfaces/usecases/appointment/IGetDoctorAppointmentByIdUsecase";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";
import { DoctorAppointmentDetailsDTO } from "../../DTOs/appointment/appointmentDTO";
import { AppointmentMapper } from "../../mappers/appointmentMapper";

export class GetDoctorAppointmentByIdUseCase implements IGetDoctorAppointmentByIdUsecase {
  constructor(private readonly appointmentRepository: IAppointmentRepository) {}

  async execute(appointmentId: string, doctorId: string): Promise<DoctorAppointmentDetailsDTO | null> {
    const appointment =
      await this.appointmentRepository.getDoctorAppointmentById(
        appointmentId,
        doctorId,
      );
    if (!appointment) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.APPOINTMENT.NOT_FOUND,
      );
    }
    return AppointmentMapper.toDoctorAppointmentDetailsDTO(appointment);
  }
}
