import { ConsultationReport } from "../../domain/entities/consultationReport";
import { ConsultationReportDTO } from "../DTOs/consultation/consultationReportDTOs";

export class ConsultationReportMapper {
  static toDTO(
    entity: ConsultationReport,
    doctorName?: string,
    doctorSpecialization?: string,
    patientName?: string,
  ): ConsultationReportDTO {
    return {
      id: entity.id ?? "",
      appointmentId: entity.appointmentId,
      patientId: entity.patientId,
      doctorId: entity.doctorId,
      chiefComplaint: entity.chiefComplaint,
      clinicalNotes: entity.clinicalNotes,
      diagnosis: entity.diagnosis,
      followUpDate: entity.followUpDate ? entity.followUpDate.toISOString() : null,
      followUpNotes: entity.followUpNotes,
      doctorName,
      doctorSpecialization,
      patientName,
      createdAt: entity.createdAt ? entity.createdAt.toISOString() : "",
      updatedAt: entity.updatedAt ? entity.updatedAt.toISOString() : "",
    };
  }
}
