import { PaginatedReviewsDTO } from "../../../../application/DTOs/review/reviewDTOs";

export interface IGetPublicDoctorReviewsUseCase {
  execute(doctorId: string, page: number, limit: number): Promise<PaginatedReviewsDTO>;
}
