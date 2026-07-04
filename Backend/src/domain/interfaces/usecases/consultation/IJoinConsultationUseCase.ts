import { Consultation } from "../../../entities/consultation";

export interface IJoinConsultationUseCase {
  execute(
    appointmentId: string,
    userId: string,
    role: "doctor" | "user",
  ): Promise<Consultation>;
}
