import { ISubmitDisputeUseCase } from "../../../domain/interfaces/usecases/disputes/ISubmitDisputeUseCase";
import { IDisputeRepository } from "../../../domain/interfaces/repositories/IDisputeRepository";
import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { SubmitDisputeDTO, DisputeResponseDTO } from "../../DTOs/dispute/disputeDTOs";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import Dispute from "../../../domain/entities/dispute";
import { DisputeMapper } from "../../mappers/disputeMapper";

export class SubmitDisputeUseCase implements ISubmitDisputeUseCase {
  constructor(
    private readonly _disputeRepository: IDisputeRepository,
    private readonly _appointmentRepository: IAppointmentRepository,
  ) {}

  async execute(
    reporterId: string,
    data: SubmitDisputeDTO,
  ): Promise<DisputeResponseDTO> {
    const { appointmentId, reason, description, evidence } = data;

    if (!description || description.trim().length < 20 || description.trim().length > 1000) {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        "Description must be between 20 and 1000 characters.",
      );
    }

    const appointment = await this._appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Appointment not found");
    }

    let reportedUserId = "";
    if (appointment.patientId === reporterId) {
      reportedUserId = appointment.doctorId;
    } else if (appointment.doctorId === reporterId) {
      reportedUserId = appointment.patientId;
    } else {
      throw new CustomError(
        HttpStatusCodes.FORBIDDEN,
        "You are not authorized to report an issue for this appointment.",
      );
    }

    const existingDispute = await this._disputeRepository.findByAppointmentAndReporter(
      appointmentId,
      reporterId,
    );
    if (existingDispute) {
      throw new CustomError(
        HttpStatusCodes.CONFLICT,
        "You have already reported an issue for this appointment.",
      );
    }

    const dispute = new Dispute({
      appointmentId,
      reporterId,
      reportedUserId,
      reason,
      description: description.trim(),
      evidence,
      status: "OPEN",
    });

    const savedDispute = await this._disputeRepository.save(dispute);
    return DisputeMapper.toResponseDTO(savedDispute);
  }
}
