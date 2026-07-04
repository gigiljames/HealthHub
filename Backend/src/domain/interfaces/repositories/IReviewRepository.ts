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

export interface IAdminReviewListItem {
  id: string;
  appointmentId: string;
  score: number;
  comment?: string;
  answers?: {
    q1?: number;
    q2?: number;
    q3?: number;
    q4?: number;
    q5?: number;
  };
  isAnonymous: boolean;
  createdAt: Date | string;
  patient: {
    id: string;
    name: string;
    email: string;
  };
  doctor: {
    id: string;
    name: string;
  };
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
    reviews: IAdminReviewListItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}
