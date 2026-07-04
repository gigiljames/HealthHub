export interface IDeleteReviewUseCase {
  execute(reviewId: string, patientId: string): Promise<boolean>;
}
