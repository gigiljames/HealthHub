import { ConsultationReportDTO } from "../../../../application/DTOs/consultation/consultationReportDTOs";

export interface IGetConsultationReportByIdUseCase {
  execute(id: string): Promise<ConsultationReportDTO | null>;
}
