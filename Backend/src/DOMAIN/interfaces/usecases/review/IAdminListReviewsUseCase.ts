export interface IAdminListReviewsUseCase {
  execute(
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
  }>;
}
