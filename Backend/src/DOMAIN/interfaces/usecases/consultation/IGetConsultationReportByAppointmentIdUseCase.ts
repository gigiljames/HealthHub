import { ConsultationReportDTO } from "../../../../application/DTOs/consultation/consultationReportDTOs";

export interface IGetConsultationReportByAppointmentIdUseCase {
  execute(appointmentId: string): Promise<ConsultationReportDTO | null>;
}
