import { NextFunction, Request, Response } from "express";
import { ICreateOrUpdateReviewUseCase } from "../../../domain/interfaces/usecases/review/ICreateOrUpdateReviewUseCase";
import { IDeleteReviewUseCase } from "../../../domain/interfaces/usecases/review/IDeleteReviewUseCase";
import { IGetReviewByAppointmentIdUseCase } from "../../../domain/interfaces/usecases/review/IGetReviewByAppointmentIdUseCase";
import { IGetPublicDoctorReviewsUseCase } from "../../../domain/interfaces/usecases/review/IGetPublicDoctorReviewsUseCase";
import { IDoctorListReviewsUseCase } from "../../../domain/interfaces/usecases/review/IDoctorListReviewsUseCase";
import { IAdminListReviewsUseCase } from "../../../domain/interfaces/usecases/review/IAdminListReviewsUseCase";
import { IAdminDeleteReviewUseCase } from "../../../domain/interfaces/usecases/review/IAdminDeleteReviewUseCase";
import { createOrUpdateReviewSchema, doctorListReviewsSchema, adminListReviewsSchema } from "../../validators/reviewValidator";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { Roles } from "../../../domain/enums/roles";
import { HTTPResponseBuilder } from "../../../utils/httpResponseBuilder";

export class ReviewController {
  constructor(
    private readonly _createOrUpdateUseCase: ICreateOrUpdateReviewUseCase,
    private readonly _deleteReviewUseCase: IDeleteReviewUseCase,
    private readonly _getByAppointmentIdUseCase: IGetReviewByAppointmentIdUseCase,
    private readonly _getPublicReviewsUseCase: IGetPublicDoctorReviewsUseCase,
    private readonly _doctorListUseCase: IDoctorListReviewsUseCase,
    private readonly _adminListUseCase: IAdminListReviewsUseCase,
    private readonly _adminDeleteUseCase: IAdminDeleteReviewUseCase,
  ) {}

  createOrUpdateReview = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const patientId = req.user?.userId;
      const role = req.user?.role;

      if (!patientId || role !== Roles.USER) {
        throw new CustomError(HttpStatusCodes.UNAUTHORIZED, "Unauthorized access.");
      }

      const parsed = createOrUpdateReviewSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          parsed.error.message || "Invalid request body.",
        );
      }

      const { appointmentId, answers, comment, isAnonymous } = parsed.data;

      const result = await this._createOrUpdateUseCase.execute({
        appointmentId,
        patientId,
        answers,
        comment,
        isAnonymous,
      });

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.CREATED,
        "Review submitted successfully.",
        result,
      );
    } catch (error) {
      next(error);
    }
  };

  deleteReview = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const patientId = req.user?.userId;
      const role = req.user?.role;
      const { id } = req.params;

      if (!patientId || role !== Roles.USER) {
        throw new CustomError(HttpStatusCodes.UNAUTHORIZED, "Unauthorized access.");
      }

      if (!id) {
        throw new CustomError(HttpStatusCodes.BAD_REQUEST, "Review ID is required.");
      }

      await this._deleteReviewUseCase.execute(id, patientId);

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Review deleted successfully.",
      );
    } catch (error) {
      next(error);
    }
  };

  getReviewByAppointmentId = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { appointmentId } = req.params;
      if (!appointmentId) {
        throw new CustomError(HttpStatusCodes.BAD_REQUEST, "Appointment ID is required.");
      }

      const result = await this._getByAppointmentIdUseCase.execute(appointmentId);

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Review fetched successfully.",
        result,
      );
    } catch (error) {
      next(error);
    }
  };

  getPublicDoctorReviews = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { doctorId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!doctorId) {
        throw new CustomError(HttpStatusCodes.BAD_REQUEST, "Doctor ID is required.");
      }

      const result = await this._getPublicReviewsUseCase.execute(doctorId, page, limit);

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Public reviews fetched successfully.",
        result,
      );
    } catch (error) {
      next(error);
    }
  };

  doctorListReviews = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const doctorId = req.user?.userId;
      const role = req.user?.role;

      if (!doctorId || role !== Roles.DOCTOR) {
        throw new CustomError(HttpStatusCodes.UNAUTHORIZED, "Unauthorized access.");
      }

      const parsed = doctorListReviewsSchema.safeParse(req);
      if (!parsed.success) {
        throw new CustomError(HttpStatusCodes.BAD_REQUEST, "Invalid filter query.");
      }

      const { page, limit, scoreMin, scoreMax, startDate, endDate } = parsed.data.query;

      const result = await this._doctorListUseCase.execute(doctorId, page, limit, {
        scoreMin,
        scoreMax,
        startDate,
        endDate,
      });

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Doctor reviews fetched successfully.",
        result,
      );
    } catch (error) {
      next(error);
    }
  };

  adminListReviews = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const role = req.user?.role;
      if (role !== Roles.ADMIN) {
        throw new CustomError(HttpStatusCodes.UNAUTHORIZED, "Unauthorized access.");
      }

      const parsed = adminListReviewsSchema.safeParse(req);
      if (!parsed.success) {
        throw new CustomError(HttpStatusCodes.BAD_REQUEST, "Invalid filter query.");
      }

      const { page, limit, search, doctorName, patientName, scoreMin, scoreMax, startDate, endDate } = parsed.data.query;

      const result = await this._adminListUseCase.execute(page, limit, {
        search,
        doctorName,
        patientName,
        scoreMin,
        scoreMax,
        startDate,
        endDate,
      });

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Admin reviews fetched successfully.",
        result,
      );
    } catch (error) {
      next(error);
    }
  };

  adminDeleteReview = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const role = req.user?.role;
      const { id } = req.params;

      if (role !== Roles.ADMIN) {
        throw new CustomError(HttpStatusCodes.UNAUTHORIZED, "Unauthorized access.");
      }

      if (!id) {
        throw new CustomError(HttpStatusCodes.BAD_REQUEST, "Review ID is required.");
      }

      await this._adminDeleteUseCase.execute(id);

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Review deleted by admin successfully.",
      );
    } catch (error) {
      next(error);
    }
  };
}

