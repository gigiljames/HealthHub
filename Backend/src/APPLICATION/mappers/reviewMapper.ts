import { Review } from "../../domain/entities/review";
import { ReviewDTO } from "../DTOs/review/reviewDTOs";

export class ReviewMapper {
  static toDTO(
    review: Review,
    patientDetails?: { name: string; profileImageUrl?: string },
  ): ReviewDTO {
    return {
      id: review.id ?? "",
      appointmentId: review.appointmentId,
      patientId: review.patientId,
      doctorId: review.doctorId,
      answers: {
        q1: review.answers.q1,
        q2: review.answers.q2,
        q3: review.answers.q3,
        q4: review.answers.q4,
        q5: review.answers.q5,
      },
      score: review.score,
      comment: review.comment,
      isAnonymous: review.isAnonymous,
      createdAt: review.createdAt ? review.createdAt.toISOString() : "",
      updatedAt: review.updatedAt ? review.updatedAt.toISOString() : "",
      patientName: patientDetails?.name,
      patientProfileImage: patientDetails?.profileImageUrl,
    };
  }
}
