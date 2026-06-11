import { IBaseRepository } from "./IBaseRepository";
import { Review } from "../../../domain/entities/review";

export interface IReviewFilterParams {
  scoreMin?: number;
  scoreMax?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface IPaginatedReviews {
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IReviewRepository extends IBaseRepository<Review> {
  create(data: Partial<Review>): Promise<Review>;
  update(id: string, data: Partial<Review>): Promise<Review>;
  findByAppointmentId(appointmentId: string): Promise<Review | null>;
  getPublicDoctorReviews(
    doctorId: string,
    page: number,
    limit: number,
  ): Promise<IPaginatedReviews>;
  doctorListReviews(
    doctorId: string,
    page: number,
    limit: number,
    filters: IReviewFilterParams,
  ): Promise<IPaginatedReviews>;
  adminListReviews(
    page: number,
    limit: number,
    filters?: {
      search?: string;
      doctorName?: string;
      patientName?: string;
      scoreMin?: number;
      scoreMax?: number;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<{
    reviews: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}
