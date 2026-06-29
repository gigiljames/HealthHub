import { ReviewRepository } from "../../infrastructure/repositories/reviewRepository";
import { AppointmentRepository } from "../../infrastructure/repositories/appointmentRepository";
import { DoctorProfileRepository } from "../../infrastructure/repositories/doctorProfileRepository";
import { S3Service } from "../../application/services/s3Service";

import { CreateOrUpdateReviewUseCase } from "../../application/usecases/review/CreateOrUpdateReviewUseCase";
import { DeleteReviewUseCase } from "../../application/usecases/review/DeleteReviewUseCase";
import { GetReviewByAppointmentIdUseCase } from "../../application/usecases/review/GetReviewByAppointmentIdUseCase";
import { GetPublicDoctorReviewsUseCase } from "../../application/usecases/review/GetPublicDoctorReviewsUseCase";
import { DoctorListReviewsUseCase } from "../../application/usecases/review/DoctorListReviewsUseCase";
import { AdminListReviewsUseCase } from "../../application/usecases/review/AdminListReviewsUseCase";
import { AdminDeleteReviewUseCase } from "../../application/usecases/review/AdminDeleteReviewUseCase";

import { ReviewController } from "../controllers/review/ReviewController";

// Repositories
const reviewRepository = new ReviewRepository();
const appointmentRepository = new AppointmentRepository();
const doctorProfileRepository = new DoctorProfileRepository();

//Services
const s3Service = new S3Service();

// Usecases
const createOrUpdateUseCase = new CreateOrUpdateReviewUseCase(
  reviewRepository,
  appointmentRepository,
  doctorProfileRepository,
);
const deleteReviewUseCase = new DeleteReviewUseCase(
  reviewRepository,
  doctorProfileRepository,
);
const getByAppointmentIdUseCase = new GetReviewByAppointmentIdUseCase(
  reviewRepository,
);
const getPublicReviewsUseCase = new GetPublicDoctorReviewsUseCase(
  reviewRepository,
  s3Service,
);
const doctorListUseCase = new DoctorListReviewsUseCase(
  reviewRepository,
  s3Service,
);
const adminListUseCase = new AdminListReviewsUseCase(reviewRepository);
const adminDeleteUseCase = new AdminDeleteReviewUseCase(
  reviewRepository,
  doctorProfileRepository,
);

//Controllers
export const injectedReviewController = new ReviewController(
  createOrUpdateUseCase,
  deleteReviewUseCase,
  getByAppointmentIdUseCase,
  getPublicReviewsUseCase,
  doctorListUseCase,
  adminListUseCase,
  adminDeleteUseCase,
);
