import { Consultation } from "../../../entities/consultation";

export interface IEndConsultationUseCase {
  execute(appointmentId: string, doctorId: string): Promise<Consultation>;
}
