import {
  CreatePrescriptionInputDTO,
  PrescriptionDTO,
} from "../../../../application/DTOs/consultation/prescriptionDTOs";

export interface ICreatePrescriptionUseCase {
  execute(input: CreatePrescriptionInputDTO): Promise<PrescriptionDTO>;
}
