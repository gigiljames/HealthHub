import { IReviewDocument } from "../../DB/models/reviewModel";
import { Review } from "../../../domain/entities/review";

export class ReviewRepoMapper {
  static toEntityFromDocument(doc: IReviewDocument): Review {
    return new Review({
      id: doc._id.toString(),
      appointmentId: doc.appointmentId.toString(),
      patientId: doc.patientId.toString(),
      doctorId: doc.doctorId.toString(),
      answers: {
        q1: doc.answers.q1,
        q2: doc.answers.q2,
        q3: doc.answers.q3,
        q4: doc.answers.q4,
        q5: doc.answers.q5,
      },
      score: doc.score,
      comment: doc.comment,
      isAnonymous: doc.isAnonymous,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
