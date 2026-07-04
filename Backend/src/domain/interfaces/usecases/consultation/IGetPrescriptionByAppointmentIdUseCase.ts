import { PrescriptionDTO } from "../../../../application/DTOs/consultation/prescriptionDTOs";

export interface IGetPrescriptionByAppointmentIdUseCase {
  execute(appointmentId: string): Promise<PrescriptionDTO | null>;
}
