import { IGetPrescriptionByIdUseCase } from "../../../domain/interfaces/usecases/consultation/IGetPrescriptionByIdUseCase";
import { IPrescriptionRepository } from "../../../domain/interfaces/repositories/IPrescriptionRepository";
import { PrescriptionDTO } from "../../DTOs/consultation/prescriptionDTOs";
import { PrescriptionMapper } from "../../mappers/prescriptionMapper";
import { authModel } from "../../../infrastructure/DB/models/authModel";
import { DoctorProfileModel } from "../../../infrastructure/DB/models/doctorProfileModel";
import { specializationModel } from "../../../infrastructure/DB/models/specializationModel";
import { appointmentModel } from "../../../infrastructure/DB/models/appointmentModel";
import { slotModel } from "../../../infrastructure/DB/models/slotModel";
import { OrganizationModel } from "../../../infrastructure/DB/models/organizationModel";
import { IS3Service } from "../../../domain/interfaces/services/IS3Service";
import { consultationReportModel } from "../../../infrastructure/DB/models/consultationReportModel";
import { PracticeLocation } from "../../../domain/types/practiceLocation";

export class GetPrescriptionByIdUseCase implements IGetPrescriptionByIdUseCase {
  constructor(
    private readonly _prescriptionRepository: IPrescriptionRepository,
    private readonly _s3Service: IS3Service,
  ) { }

  async execute(id: string): Promise<PrescriptionDTO | null> {
    const prescription = await this._prescriptionRepository.findById(id);
    if (!prescription) return null;

    const patientDoc = await authModel.findById(prescription.patientId);
    const doctorDoc = await authModel.findById(prescription.doctorId);

    let specName = "";
    const doctorEmail = doctorDoc?.email ?? "";
    let doctorPhone = "";
    let doctorQualifications = "";
    let organizationName = "";
    let organizationAddress = "";

    if (doctorDoc) {
      const docProfile = await DoctorProfileModel.findOne({ doctorId: doctorDoc._id });
      if (docProfile) {
        doctorPhone = docProfile.phone || "";
        if (docProfile.specialization) {
          const spec = await specializationModel.findById(docProfile.specialization);
          specName = spec?.name ?? "";
        }
        if (docProfile.education && docProfile.education.length > 0) {
          doctorQualifications = docProfile.education.map((e) => e.title).join(", ");
        }

        // Fetch organization details if linked via appointment -> slot -> practiceLocationId
        try {
          const appointment = await appointmentModel.findById(prescription.appointmentId);
          if (appointment) {
            const slot = await slotModel.findById(appointment.slotId);
            if (slot && slot.practiceLocationId) {
              const matchingLocation = docProfile.practiceLocations.find(
                (loc: PracticeLocation) => loc._id?.toString() === slot.practiceLocationId?.toString()
              );
              if (matchingLocation && matchingLocation.organizationId) {
                const org = await OrganizationModel.findById(matchingLocation.organizationId);
                if (org) {
                  organizationName = org.name;
                  organizationAddress = org.location?.address ?? "";
                }
              }
            }
          }
        } catch (err) {
          console.error("Failed to fetch organization details for prescription", err);
        }
      }
    }

    const dto = PrescriptionMapper.toDTO(
      prescription,
      doctorDoc?.name ?? "",
      specName,
      patientDoc?.name ?? "",
      doctorEmail,
      doctorPhone,
      doctorQualifications,
      organizationName,
      organizationAddress,
    );

    if (prescription.signatureKey) {
      try {
        dto.signatureUrl = await this._s3Service.getAccessSignedUrl(prescription.signatureKey, "inline");
      } catch (err) {
        console.error("Failed to generate signature url", err);
      }
    }

    try {
      const reportDoc = await consultationReportModel.findOne({ appointmentId: prescription.appointmentId }).lean();
      if (reportDoc) {
        dto.consultationReportId = reportDoc._id.toString();
      }
    } catch (err) {
      console.error("Failed to fetch linked consultation report", err);
    }

    return dto;
  }
}
