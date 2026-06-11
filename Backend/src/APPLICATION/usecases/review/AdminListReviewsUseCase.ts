import { IAdminListReviewsUseCase } from "../../../domain/interfaces/usecases/review/IAdminListReviewsUseCase";
import { IReviewRepository } from "../../../domain/interfaces/repositories/IReviewRepository";

export class AdminListReviewsUseCase implements IAdminListReviewsUseCase {
  constructor(private readonly _reviewRepository: IReviewRepository) { }

  async execute(
    page: number,
    limit: number,
    filters?: {
      search?: string;
      doctorName?: string;
      patientName?: string;
      scoreMin?: number;
      scoreMax?: number;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<{
    reviews: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const filterParams: any = {};
    if (filters) {
      if (filters.search !== undefined) filterParams.search = filters.search;
      if (filters.doctorName !== undefined) filterParams.doctorName = filters.doctorName;
      if (filters.patientName !== undefined) filterParams.patientName = filters.patientName;
      if (filters.scoreMin !== undefined) filterParams.scoreMin = filters.scoreMin;
      if (filters.scoreMax !== undefined) filterParams.scoreMax = filters.scoreMax;
      if (filters.startDate) filterParams.startDate = new Date(filters.startDate);
      if (filters.endDate) filterParams.endDate = new Date(filters.endDate);
    }
    return await this._reviewRepository.adminListReviews(page, limit, filterParams);
  }
}
