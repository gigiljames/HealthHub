import { IAdminListReviewsUseCase } from "../../../domain/interfaces/usecases/review/IAdminListReviewsUseCase";
import { IAdminReviewListItem, IReviewRepository } from "../../../domain/interfaces/repositories/IReviewRepository";

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
    reviews: IAdminReviewListItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const filterParams: { search?: string, doctorName?: string, patientName?: string, scoreMin?: number, scoreMax?: number, startDate?: Date, endDate?: Date } = {};
    if (filters) {
      if (filters.search !== undefined) filterParams.search = filters.search;
      if (filters.doctorName !== undefined) filterParams.doctorName = filters.doctorName;
      if (filters.patientName !== undefined) filterParams.patientName = filters.patientName;
      if (filters.scoreMin !== undefined) filterParams.scoreMin = filters.scoreMin;
      if (filters.scoreMax !== undefined) filterParams.scoreMax = filters.scoreMax;
      if (filters.startDate) filterParams.startDate = new Date(filters.startDate);
      if (filters.endDate) filterParams.endDate = new Date(`${filters.endDate}T23:59:59.999Z`);
    }
    return await this._reviewRepository.adminListReviews(page, limit, filterParams);
  }
}
