import { PaginatedReviewsDTO } from "../../../../application/DTOs/review/reviewDTOs";

export interface IDoctorListReviewsUseCase {
  execute(
    doctorId: string,
    page: number,
    limit: number,
    filters: { scoreMin?: number; scoreMax?: number; startDate?: string; endDate?: string },
  ): Promise<PaginatedReviewsDTO>;
}
