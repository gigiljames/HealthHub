import {
  CreateConsultationReportInputDTO,
  ConsultationReportDTO,
} from "../../../../application/DTOs/consultation/consultationReportDTOs";

export interface ICreateConsultationReportUseCase {
  execute(input: CreateConsultationReportInputDTO): Promise<ConsultationReportDTO>;
}
