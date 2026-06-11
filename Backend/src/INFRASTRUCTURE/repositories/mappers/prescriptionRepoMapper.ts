import { IPrescriptionDocument } from "../../DB/models/prescriptionModel";
import { Prescription } from "../../../domain/entities/prescription";

export class PrescriptionRepoMapper {
  static toEntityFromDocument(doc: IPrescriptionDocument): Prescription {
    return new Prescription({
      id: doc._id.toString(),
      appointmentId: doc.appointmentId.toString(),
      patientId: doc.patientId.toString(),
      doctorId: doc.doctorId.toString(),
      medicines: doc.medicines.map((m) => ({
        medicine: m.medicine,
        dosage: m.dosage,
        frequency: m.frequency,
        timing: m.timing,
        duration: m.duration,
      })),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
