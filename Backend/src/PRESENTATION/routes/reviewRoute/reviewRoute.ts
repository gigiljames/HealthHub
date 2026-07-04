import { Router } from "express";
import { injectedReviewController } from "../../DI/review";
import { authMiddleware } from "../../middlewares/authMiddleware";
import TokenService from "../../../application/services/tokenService";
import { AuthRepository } from "../../../infrastructure/repositories/authRepository";
import { Roles } from "../../../domain/enums/roles";
import { ROUTES } from "../../../domain/constants/routes";

const tokenService = new TokenService();
const authRepository = new AuthRepository();

export class ReviewRoute {
  public reviewRouter: Router;

  constructor() {
    this.reviewRouter = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Create/Update review (Patient only)
    this.reviewRouter.post(
      ROUTES.REVIEW.CREATE_OR_UPDATE,
      authMiddleware([Roles.USER], tokenService, authRepository),
      (req, res, next) => {
        injectedReviewController.createOrUpdateReview(req, res, next);
      },
    );

    // Delete review (Patient only)
    this.reviewRouter.delete(
      ROUTES.REVIEW.DELETE,
      authMiddleware([Roles.USER], tokenService, authRepository),
      (req, res, next) => {
        injectedReviewController.deleteReview(req, res, next);
      },
    );

    // Get review by Appointment ID (Patient, Doctor, Admin)
    this.reviewRouter.get(
      ROUTES.REVIEW.GET_BY_APPOINTMENT_ID,
      authMiddleware([Roles.USER, Roles.DOCTOR, Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedReviewController.getReviewByAppointmentId(req, res, next);
      },
    );

    // Get public doctor reviews (Public - guests can view)
    this.reviewRouter.get(
      ROUTES.REVIEW.GET_PUBLIC_DOCTOR_REVIEWS,
      (req, res, next) => {
        injectedReviewController.getPublicDoctorReviews(req, res, next);
      },
    );

    // Doctor list reviews (Doctor only)
    this.reviewRouter.get(
      ROUTES.REVIEW.DOCTOR_LIST,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedReviewController.doctorListReviews(req, res, next);
      },
    );

    // Admin list reviews (Admin only)
    this.reviewRouter.get(
      ROUTES.REVIEW.ADMIN_LIST,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedReviewController.adminListReviews(req, res, next);
      },
    );

    // Admin delete review (Admin only)
    this.reviewRouter.delete(
      ROUTES.REVIEW.ADMIN_DELETE,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedReviewController.adminDeleteReview(req, res, next);
      },
    );
  }
}
