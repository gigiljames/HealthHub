import { CreateOrUpdateReviewInputDTO, ReviewDTO } from "../../../../application/DTOs/review/reviewDTOs";

export interface ICreateOrUpdateReviewUseCase {
  execute(input: CreateOrUpdateReviewInputDTO): Promise<ReviewDTO>;
}
