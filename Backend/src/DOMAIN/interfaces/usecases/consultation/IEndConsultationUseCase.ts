import { Consultation } from "../../../entities/consultation";

export interface IEndConsultationUseCase {
  execute(
    appointmentId: string,
    userId: string,
    role: "doctor" | "user",
  ): Promise<Consultation>;
}
