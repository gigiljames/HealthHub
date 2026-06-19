import { ICreateConsultationReportUseCase } from "../../../domain/interfaces/usecases/consultation/ICreateConsultationReportUseCase";
import { IConsultationReportRepository } from "../../../domain/interfaces/repositories/IConsultationReportRepository";
import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import {
  CreateConsultationReportInputDTO,
  ConsultationReportDTO,
} from "../../DTOs/consultation/consultationReportDTOs";
import { ConsultationReportMapper } from "../../mappers/consultationReportMapper";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { authModel } from "../../../infrastructure/DB/models/authModel";
import { DoctorProfileModel } from "../../../infrastructure/DB/models/doctorProfileModel";
import { specializationModel } from "../../../infrastructure/DB/models/specializationModel";

export class CreateConsultationReportUseCase implements ICreateConsultationReportUseCase {
  constructor(
    private readonly _reportRepository: IConsultationReportRepository,
    private readonly _appointmentRepository: IAppointmentRepository,
  ) { }

  async execute(input: CreateConsultationReportInputDTO): Promise<ConsultationReportDTO> {
    const appointment = await this._appointmentRepository.findById(input.appointmentId);
    if (!appointment) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Appointment not found.");
    }

    // Check if report already exists for this appointment
    const existing = await this._reportRepository.findByAppointmentId(input.appointmentId);
    let report;
    if (existing) {
      report = await this._reportRepository.updateByAppointmentId(input.appointmentId, {
        chiefComplaint: input.chiefComplaint,
        clinicalNotes: input.clinicalNotes ?? "",
        diagnosis: input.diagnosis,
        followUpDate: input.followUpDate,
        followUpNotes: input.followUpNotes ?? "",
      });
    } else {
      report = await this._reportRepository.create({
        appointmentId: input.appointmentId,
        patientId: input.patientId,
        doctorId: input.doctorId,
        chiefComplaint: input.chiefComplaint,
        clinicalNotes: input.clinicalNotes ?? "",
        diagnosis: input.diagnosis,
        followUpDate: input.followUpDate,
        followUpNotes: input.followUpNotes ?? "",
      });
    }

    // Populate extra metadata fields for response DTO
    const patientDoc = await authModel.findById(report.patientId);
    const doctorDoc = await authModel.findById(report.doctorId);
    let specName = "";
    if (doctorDoc) {
      const docProfile = await DoctorProfileModel.findOne({ doctorId: doctorDoc._id });
      if (docProfile?.specialization) {
        const spec = await specializationModel.findById(docProfile.specialization);
        specName = spec?.name ?? "";
      }
    }

    return ConsultationReportMapper.toDTO(
      report,
      doctorDoc?.name ?? "",
      specName,
      patientDoc?.name ?? "",
    );
  }
}
