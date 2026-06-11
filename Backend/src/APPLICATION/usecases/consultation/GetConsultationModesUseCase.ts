import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { IGetConsultationModesUseCase } from "../../../domain/interfaces/usecases/consultation/IGetConsultationModesUseCase";
import {
  GetConsultationModesInputDTO,
  GetConsultationModesOutputDTO,
} from "../../DTOs/consultation/consultationModesDTO";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";

export class GetConsultationModesUseCase implements IGetConsultationModesUseCase {
  constructor(
    private readonly _appointmentRepository: IAppointmentRepository,
  ) { }

  async execute(
    input: GetConsultationModesInputDTO,
  ): Promise<GetConsultationModesOutputDTO> {
    const appointment = await this._appointmentRepository.getAdminAppointmentById(
      input.appointmentId,
    );
    if (!appointment) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.APPOINTMENT.NOT_FOUND,
      );
    }

    const modes = appointment.slot?.consultationModes || [];
    return {
      supportedModes: modes,
    };
  }
}
