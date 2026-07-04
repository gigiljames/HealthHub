import { IListConsultationReportsUseCase } from "../../../domain/interfaces/usecases/consultation/IListConsultationReportsUseCase";
import { IConsultationReportRepository, IConsultationReportFilterParams } from "../../../domain/interfaces/repositories/IConsultationReportRepository";
import {
  ConsultationReportListFilterDTO,
  PaginatedConsultationReportsDTO,
} from "../../DTOs/consultation/consultationReportDTOs";
import { ConsultationReportMapper } from "../../mappers/consultationReportMapper";
import { Roles } from "../../../domain/enums/roles";
import { authModel } from "../../../infrastructure/DB/models/authModel";
import { DoctorProfileModel } from "../../../infrastructure/DB/models/doctorProfileModel";
import { specializationModel } from "../../../infrastructure/DB/models/specializationModel";

export class ListConsultationReportsUseCase implements IListConsultationReportsUseCase {
  constructor(private readonly _reportRepository: IConsultationReportRepository) {}

  async execute(
    userId: string,
    role: string,
    page: number,
    limit: number,
    filters: ConsultationReportListFilterDTO,
  ): Promise<PaginatedConsultationReportsDTO> {
    const repoFilters: IConsultationReportFilterParams = {
      search: filters.search,
      specialization: filters.specialization,
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(`${filters.endDate}T23:59:59.999Z`) : undefined,
      doctorId: filters.doctorId,
    };

    let result;
    if (filters.patientId) {
      result = await this._reportRepository.getPatientReports(filters.patientId, page, limit, repoFilters);
    } else if (role === Roles.DOCTOR) {
      result = await this._reportRepository.getDoctorReports(userId, page, limit, repoFilters);
    } else {
      result = await this._reportRepository.getPatientReports(userId, page, limit, repoFilters);
    }

    const reportDTOs = await Promise.all(
      result.reports.map(async (r) => {
        const patientDoc = await authModel.findById(r.patientId);
        const doctorDoc = await authModel.findById(r.doctorId);
        let specName = "";
        if (doctorDoc) {
          const docProfile = await DoctorProfileModel.findOne({ doctorId: doctorDoc._id });
          if (docProfile?.specialization) {
            const spec = await specializationModel.findById(docProfile.specialization);
            specName = spec?.name ?? "";
          }
        }
        return ConsultationReportMapper.toDTO(
          r,
          doctorDoc?.name ?? "",
          specName,
          patientDoc?.name ?? "",
        );
      }),
    );

    return {
      reports: reportDTOs,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
