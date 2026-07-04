import { IGetConsultationReportByAppointmentIdUseCase } from "../../../domain/interfaces/usecases/consultation/IGetConsultationReportByAppointmentIdUseCase";
import { IConsultationReportRepository } from "../../../domain/interfaces/repositories/IConsultationReportRepository";
import { ConsultationReportDTO } from "../../DTOs/consultation/consultationReportDTOs";
import { ConsultationReportMapper } from "../../mappers/consultationReportMapper";
import { authModel } from "../../../infrastructure/DB/models/authModel";
import { DoctorProfileModel } from "../../../infrastructure/DB/models/doctorProfileModel";
import { specializationModel } from "../../../infrastructure/DB/models/specializationModel";

export class GetConsultationReportByAppointmentIdUseCase
  implements IGetConsultationReportByAppointmentIdUseCase
{
  constructor(private readonly _reportRepository: IConsultationReportRepository) {}

  async execute(appointmentId: string): Promise<ConsultationReportDTO | null> {
    const report = await this._reportRepository.findByAppointmentId(appointmentId);
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

    return ConsultationReportMapper.toDTO(
      report,
      doctorDoc?.name ?? "",
      specName,
      patientDoc?.name ?? "",
    );
  }
}
