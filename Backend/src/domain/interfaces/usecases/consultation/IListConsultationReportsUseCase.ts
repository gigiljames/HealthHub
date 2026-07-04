import {
  ConsultationReportListFilterDTO,
  PaginatedConsultationReportsDTO,
} from "../../../../application/DTOs/consultation/consultationReportDTOs";

export interface IListConsultationReportsUseCase {
  execute(
    userId: string,
    role: string,
    page: number,
    limit: number,
    filters: ConsultationReportListFilterDTO,
  ): Promise<PaginatedConsultationReportsDTO>;
}
