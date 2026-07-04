import { IReviewRepository } from "../../../domain/interfaces/repositories/IReviewRepository";
import { IGetReviewByAppointmentIdUseCase } from "../../../domain/interfaces/usecases/review/IGetReviewByAppointmentIdUseCase";
import { ReviewDTO } from "../../DTOs/review/reviewDTOs";
import { ReviewMapper } from "../../mappers/reviewMapper";


export class GetReviewByAppointmentIdUseCase implements IGetReviewByAppointmentIdUseCase {
  constructor(private readonly _reviewRepository: IReviewRepository) { }

  async execute(appointmentId: string): Promise<ReviewDTO | null> {
    const review = await this._reviewRepository.findByAppointmentId(appointmentId);
    if (!review) return null;
    return ReviewMapper.toDTO(review);
  }
}
