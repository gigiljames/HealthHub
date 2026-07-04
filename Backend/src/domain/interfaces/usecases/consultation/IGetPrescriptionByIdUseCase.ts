import { PrescriptionDTO } from "../../../../application/DTOs/consultation/prescriptionDTOs";

export interface IGetPrescriptionByIdUseCase {
  execute(id: string): Promise<PrescriptionDTO | null>;
}
