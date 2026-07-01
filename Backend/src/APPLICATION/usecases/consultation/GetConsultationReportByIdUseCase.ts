import { IGetConsultationReportByIdUseCase } from "../../../domain/interfaces/usecases/consultation/IGetConsultationReportByIdUseCase";
import { IConsultationReportRepository } from "../../../domain/interfaces/repositories/IConsultationReportRepository";
import { ConsultationReportDTO } from "../../DTOs/consultation/consultationReportDTOs";
import { ConsultationReportMapper } from "../../mappers/consultationReportMapper";
import { authModel } from "../../../infrastructure/DB/models/authModel";
import { DoctorProfileModel } from "../../../infrastructure/DB/models/doctorProfileModel";
import { specializationModel } from "../../../infrastructure/DB/models/specializationModel";
import { prescriptionModel } from "../../../infrastructure/DB/models/prescriptionModel";

export class GetConsultationReportByIdUseCase implements IGetConsultationReportByIdUseCase {
  constructor(private readonly _reportRepository: IConsultationReportRepository) {}

  async execute(id: string): Promise<ConsultationReportDTO | null> {
    const report = await this._reportRepository.findById(id);
    if (!report) return null;

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

    const dto = ConsultationReportMapper.toDTO(
      report,
      doctorDoc?.name ?? "",
      specName,
      patientDoc?.name ?? "",
    );

    try {
      const prescriptionDoc = await prescriptionModel.findOne({ appointmentId: report.appointmentId }).lean();
      if (prescriptionDoc) {
        dto.prescriptionId = prescriptionDoc._id.toString();
      }
    } catch (err) {
      console.error("Failed to fetch linked prescription details", err);
    }

    return dto;
  }
}
