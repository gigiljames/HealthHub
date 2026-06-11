import { Consultation } from "../../domain/entities/consultation";
import { IConsultationDocument } from "../../infrastructure/DB/models/consultationModel";

export class ConsultationMapper {
  static toEntityFromDocument(doc: any): Consultation {
    return new Consultation({
      id: doc._id.toString(),
      appointmentId: doc.appointmentId.toString(),
      patientId: doc.patientId.toString(),
      doctorId: doc.doctorId.toString(),
      patientJoinedAt: doc.patientJoinedAt,
      doctorJoinedAt: doc.doctorJoinedAt,
      startedAt: doc.startedAt,
      endedAt: doc.endedAt,
      roomId: doc.roomId,
      patientSocketId: doc.patientSocketId,
      doctorSocketId: doc.doctorSocketId,
    });
  }
}
