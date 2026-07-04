import { ReviewDTO } from "../../../../application/DTOs/review/reviewDTOs";

export interface IGetReviewByAppointmentIdUseCase {
  execute(appointmentId: string): Promise<ReviewDTO | null>;
}
