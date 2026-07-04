import { PrescriptionDTO } from "../../../../application/DTOs/consultation/prescriptionDTOs";

export interface IRevokePrescriptionUseCase {
  execute(prescriptionId: string, doctorId: string): Promise<PrescriptionDTO>;
}
