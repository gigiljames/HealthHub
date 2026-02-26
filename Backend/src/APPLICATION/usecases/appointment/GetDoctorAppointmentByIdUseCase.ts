import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { IGetDoctorAppointmentByIdUsecase } from "../../../domain/interfaces/usecases/appointment/IGetDoctorAppointmentByIdUsecase";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";

export class GetDoctorAppointmentByIdUseCase implements IGetDoctorAppointmentByIdUsecase {
  constructor(private readonly appointmentRepository: IAppointmentRepository) {}

  async execute(appointmentId: string, doctorId: string): Promise<any | null> {
    const appointment =
      await this.appointmentRepository.getDoctorAppointmentById(
        appointmentId,
        doctorId,
      );
    if (!appointment) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        "Appointment not found.",
      );
    }
    return appointment;
  }
}
