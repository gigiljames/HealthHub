import { Prescription } from "../../domain/entities/prescription";
import { PrescriptionDTO } from "../DTOs/consultation/prescriptionDTOs";

export class PrescriptionMapper {
  static toDTO(
    entity: Prescription,
    doctorName?: string,
    doctorSpecialization?: string,
    patientName?: string,
    doctorEmail?: string,
    doctorPhone?: string,
    doctorQualifications?: string,
    organizationName?: string,
    organizationAddress?: string,
  ): PrescriptionDTO {
    return {
      id: entity.id ?? "",
      appointmentId: entity.appointmentId,
      patientId: entity.patientId,
      doctorId: entity.doctorId,
      medicines: entity.medicines.map((m) => ({
        medicine: m.medicine,
        dosage: m.dosage,
        frequency: m.frequency,
        timing: m.timing,
        duration: m.duration,
      })),
      doctorName,
      doctorSpecialization,
      patientName,
      doctorEmail,
      doctorPhone,
      doctorQualifications,
      organizationName,
      organizationAddress,
      verificationToken: entity.verificationToken,
      prescriptionNumber: entity.prescriptionNumber,
      status: entity.status,
      signatureKey: entity.signatureKey,
      createdAt: entity.createdAt ? entity.createdAt.toISOString() : "",
      updatedAt: entity.updatedAt ? entity.updatedAt.toISOString() : "",
    };
  }
}
