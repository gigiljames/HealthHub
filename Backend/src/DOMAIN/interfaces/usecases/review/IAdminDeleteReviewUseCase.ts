export interface IAdminDeleteReviewUseCase {
  execute(reviewId: string): Promise<boolean>;
}
