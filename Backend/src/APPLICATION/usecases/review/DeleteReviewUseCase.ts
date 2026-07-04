import { Types } from "mongoose";
import { IDeleteReviewUseCase } from "../../../domain/interfaces/usecases/review/IDeleteReviewUseCase";
import { IReviewRepository } from "../../../domain/interfaces/repositories/IReviewRepository";
import { IDoctorProfileRepository } from "../../../domain/interfaces/repositories/IDoctorProfileRepository";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { CustomError } from "../../../domain/entities/customError";
import { reviewModel } from "../../../infrastructure/DB/models/reviewModel";

export class DeleteReviewUseCase implements IDeleteReviewUseCase {
  constructor(
    private readonly _reviewRepository: IReviewRepository,
    private readonly _doctorProfileRepository: IDoctorProfileRepository,
  ) { }

  async execute(reviewId: string, patientId: string): Promise<boolean> {
    const review = await this._reviewRepository.findById(reviewId);
    if (!review) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Review not found.");
    }

    if (review.patientId !== patientId) {
      throw new CustomError(HttpStatusCodes.FORBIDDEN, "You are not authorized to delete this review.");
    }

    await this._reviewRepository.deleteById(reviewId);

    const doctorId = review.doctorId;
    const stats = await reviewModel.aggregate([
      { $match: { doctorId: new Types.ObjectId(doctorId) } },
      {
        $group: {
          _id: "$doctorId",
          avgScore: { $avg: "$score" },
          count: { $sum: 1 },
        },
      },
    ]);

    const avg = stats.length > 0 ? Math.round(stats[0].avgScore) : 0;
    const count = stats.length > 0 ? stats[0].count : 0;

    await this._doctorProfileRepository.updateRating(doctorId, avg, count);

    return true;
  }
}
