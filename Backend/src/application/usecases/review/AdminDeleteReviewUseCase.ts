import { IAdminDeleteReviewUseCase } from "../../../domain/interfaces/usecases/review/IAdminDeleteReviewUseCase";
import { IReviewRepository } from "../../../domain/interfaces/repositories/IReviewRepository";
import { IDoctorProfileRepository } from "../../../domain/interfaces/repositories/IDoctorProfileRepository";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { reviewModel } from "../../../infrastructure/DB/models/reviewModel";
import { Types } from "mongoose";

export class AdminDeleteReviewUseCase implements IAdminDeleteReviewUseCase {
  constructor(
    private readonly _reviewRepository: IReviewRepository,
    private readonly _doctorProfileRepository: IDoctorProfileRepository,
  ) { }

  async execute(reviewId: string): Promise<boolean> {
    const review = await this._reviewRepository.findById(reviewId);
    if (!review) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Review not found.");
    }

    await this._reviewRepository.deleteById(reviewId);

    // Recalculate average rating & review count for the doctor
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
