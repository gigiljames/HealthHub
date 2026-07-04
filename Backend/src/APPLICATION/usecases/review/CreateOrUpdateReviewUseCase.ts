
import { Types } from "mongoose";
import { ICreateOrUpdateReviewUseCase } from "../../../domain/interfaces/usecases/review/ICreateOrUpdateReviewUseCase";
import { IReviewRepository } from "../../../domain/interfaces/repositories/IReviewRepository";
import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { IDoctorProfileRepository } from "../../../domain/interfaces/repositories/IDoctorProfileRepository";
import { CreateOrUpdateReviewInputDTO, ReviewDTO } from "../../DTOs/review/reviewDTOs";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { CustomError } from "../../../domain/entities/customError";
import { reviewModel } from "../../../infrastructure/DB/models/reviewModel";
import { ReviewMapper } from "../../mappers/reviewMapper";
import { Review } from "../../../domain/entities/review";

export class CreateOrUpdateReviewUseCase implements ICreateOrUpdateReviewUseCase {
  constructor(
    private readonly _reviewRepository: IReviewRepository,
    private readonly _appointmentRepository: IAppointmentRepository,
    private readonly _doctorProfileRepository: IDoctorProfileRepository,
  ) { }

  async execute(input: CreateOrUpdateReviewInputDTO): Promise<ReviewDTO> {
    const appointment = await this._appointmentRepository.findById(input.appointmentId);
    if (!appointment) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Appointment not found.");
    }

    if (appointment.patientId !== input.patientId) {
      throw new CustomError(HttpStatusCodes.FORBIDDEN, "You are not authorized to review this appointment.");
    }

    if (appointment.status.toUpperCase() !== "COMPLETED") {
      throw new CustomError(HttpStatusCodes.BAD_REQUEST, "Reviews are only allowed for completed consultations.");
    }

    const answerValues: Record<string, number> = {
      Excellent: 100,
      Good: 75,
      Average: 50,
      Poor: 25,
    };

    const q1Val = answerValues[input.answers.q1] ?? 50;
    const q2Val = answerValues[input.answers.q2] ?? 50;
    const q3Val = answerValues[input.answers.q3] ?? 50;
    const q4Val = answerValues[input.answers.q4] ?? 50;
    const q5Val = answerValues[input.answers.q5] ?? 50;

    const calculatedScore = Math.round((q1Val + q2Val + q3Val + q4Val + q5Val) / 5);

    const existingReview = await this._reviewRepository.findByAppointmentId(input.appointmentId);
    let review: Review;

    if (existingReview) {
      review = await this._reviewRepository.update(existingReview.id!, {
        answers: input.answers,
        score: calculatedScore,
        comment: input.comment ?? "",
        isAnonymous: input.isAnonymous,
      });
    } else {
      review = await this._reviewRepository.create({
        appointmentId: input.appointmentId,
        patientId: input.patientId,
        doctorId: appointment.doctorId,
        answers: input.answers,
        score: calculatedScore,
        comment: input.comment ?? "",
        isAnonymous: input.isAnonymous,
      });
    }

    const doctorId = appointment.doctorId;
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

    return ReviewMapper.toDTO(review);
  }
}
