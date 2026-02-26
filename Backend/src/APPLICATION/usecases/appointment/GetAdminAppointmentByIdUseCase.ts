import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { IGetAdminAppointmentByIdUsecase } from "../../../domain/interfaces/usecases/appointment/IGetAdminAppointmentByIdUsecase";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";

export class GetAdminAppointmentByIdUseCase implements IGetAdminAppointmentByIdUsecase {
  constructor(private readonly appointmentRepository: IAppointmentRepository) {}

  async execute(appointmentId: string): Promise<any | null> {
    const appointment =
      await this.appointmentRepository.getAdminAppointmentById(appointmentId);
    if (!appointment) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        "Appointment not found.",
      );
    }
    return appointment;
  }
}
