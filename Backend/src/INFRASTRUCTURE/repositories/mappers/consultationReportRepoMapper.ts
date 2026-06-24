import { IConsultationReportDocument } from "../../DB/models/consultationReportModel";
import { ConsultationReport } from "../../../domain/entities/consultationReport";

export class ConsultationReportRepoMapper {
  static toEntityFromDocument(doc: IConsultationReportDocument): ConsultationReport {
    return new ConsultationReport({
      id: doc._id.toString(),
      appointmentId: doc.appointmentId.toString(),
      patientId: doc.patientId.toString(),
      doctorId: doc.doctorId.toString(),
      chiefComplaint: doc.chiefComplaint,
      clinicalNotes: doc.clinicalNotes,
      diagnosis: doc.diagnosis,
      followUpDate: doc.followUpDate,
      followUpNotes: doc.followUpNotes,
      followUpNotificationSent: doc.followUpNotificationSent,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
