import api from "./axios";

export const createOrUpdateReview = async (reviewData: {
  appointmentId: string;
  answers: {
    q1: string;
    q2: string;
    q3: string;
    q4: string;
    q5: string;
  };
  comment?: string;
  isAnonymous: boolean;
}) => {
  const response = await api.post("/reviews", reviewData);
  return response.data;
};

export const deleteReview = async (reviewId: string) => {
  const response = await api.delete(`/reviews/${reviewId}`);
  return response.data;
};

export const getReviewByAppointmentId = async (appointmentId: string) => {
  const response = await api.get(`/reviews/appointment/${appointmentId}`);
  return response.data;
};

export const getPublicDoctorReviews = async (
  doctorId: string,
  page: number,
  limit: number,
) => {
  const response = await api.get(`/reviews/doctor/${doctorId}/public`, {
    params: { page, limit },
  });
  return response.data;
};

export const doctorListReviews = async (params: {
  page: number;
  limit: number;
  scoreMin?: number;
  scoreMax?: number;
  startDate?: string;
  endDate?: string;
}) => {
  const response = await api.get("/reviews/doctor", { params });
  return response.data;
};

export const adminListReviews = async (params: {
  page: number;
  limit: number;
  search?: string;
  doctorName?: string;
  patientName?: string;
  scoreMin?: number;
  scoreMax?: number;
  startDate?: string;
  endDate?: string;
}) => {
  const response = await api.get("/reviews/admin", { params });
  return response.data;
};

export const adminDeleteReview = async (reviewId: string) => {
  const response = await api.delete(`/reviews/admin/${reviewId}`);
  return response.data;
};
