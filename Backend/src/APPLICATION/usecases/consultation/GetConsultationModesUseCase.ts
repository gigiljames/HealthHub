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

    const modes: string[] = appointment.slot?.consultationModes || [];
    const expandedModes: string[] = [];
    if (modes.includes("VIDEO")) {
      expandedModes.push("VIDEO", "AUDIO", "CHAT");
    } else if (modes.includes("AUDIO")) {
      expandedModes.push("AUDIO", "CHAT");
    } else if (modes.includes("CHAT")) {
      expandedModes.push("CHAT");
    }

    return {
      supportedModes: expandedModes,
    };
  }
}
