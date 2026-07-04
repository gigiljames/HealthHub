import {
  PrescriptionListFilterDTO,
  PaginatedPrescriptionsDTO,
} from "../../../../application/DTOs/consultation/prescriptionDTOs";

export interface IListPrescriptionsUseCase {
  execute(
    userId: string,
    role: string,
    page: number,
    limit: number,
    filters: PrescriptionListFilterDTO,
  ): Promise<PaginatedPrescriptionsDTO>;
}
