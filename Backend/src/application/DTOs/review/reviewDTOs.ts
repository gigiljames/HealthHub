export interface CreateOrUpdateReviewInputDTO {
  appointmentId: string;
  patientId: string;
  answers: {
    q1: string;
    q2: string;
    q3: string;
    q4: string;
    q5: string;
  };
  comment?: string;
  isAnonymous: boolean;
}

export interface ReviewDTO {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  answers: {
    q1: string;
    q2: string;
    q3: string;
    q4: string;
    q5: string;
  };
  score: number;
  comment?: string;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
  patientName?: string;
  patientProfileImage?: string;
}

export interface PaginatedReviewsDTO {
  reviews: ReviewDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
