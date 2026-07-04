import { NextFunction, Request, Response } from "express";
import { ICreateUploadedDocumentUseCase } from "../../../domain/interfaces/usecases/patient/uploadedDocument/ICreateUploadedDocumentUseCase";
import { IGetUploadedDocumentsUseCase } from "../../../domain/interfaces/usecases/patient/uploadedDocument/IGetUploadedDocumentsUseCase";
import { IGetUploadedDocumentUseCase } from "../../../domain/interfaces/usecases/patient/uploadedDocument/IGetUploadedDocumentUseCase";
import { IUpdateUploadedDocumentUseCase } from "../../../domain/interfaces/usecases/patient/uploadedDocument/IUpdateUploadedDocumentUseCase";
import { IDeleteUploadedDocumentUseCase } from "../../../domain/interfaces/usecases/patient/uploadedDocument/IDeleteUploadedDocumentUseCase";
import { IS3Service } from "../../../domain/interfaces/services/IS3Service";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { Roles } from "../../../domain/enums/roles";
import { MESSAGES } from "../../../domain/constants/messages";
import { consultationModel } from "../../../infrastructure/DB/models/consultationModel";
import { HTTPResponseBuilder } from "../../../utils/httpResponseBuilder";

export class UploadedDocumentController {
  private readonly _createUploadedDocumentUseCase: ICreateUploadedDocumentUseCase;
  private readonly _getUploadedDocumentsUseCase: IGetUploadedDocumentsUseCase;
  private readonly _getUploadedDocumentUseCase: IGetUploadedDocumentUseCase;
  private readonly _updateUploadedDocumentUseCase: IUpdateUploadedDocumentUseCase;
  private readonly _deleteUploadedDocumentUseCase: IDeleteUploadedDocumentUseCase;
  private readonly _s3Service: IS3Service;

  constructor(
    createUploadedDocumentUseCase: ICreateUploadedDocumentUseCase,
    getUploadedDocumentsUseCase: IGetUploadedDocumentsUseCase,
    getUploadedDocumentUseCase: IGetUploadedDocumentUseCase,
    updateUploadedDocumentUseCase: IUpdateUploadedDocumentUseCase,
    deleteUploadedDocumentUseCase: IDeleteUploadedDocumentUseCase,
    s3Service: IS3Service
  ) {
    this._createUploadedDocumentUseCase = createUploadedDocumentUseCase;
    this._getUploadedDocumentsUseCase = getUploadedDocumentsUseCase;
    this._getUploadedDocumentUseCase = getUploadedDocumentUseCase;
    this._updateUploadedDocumentUseCase = updateUploadedDocumentUseCase;
    this._deleteUploadedDocumentUseCase = deleteUploadedDocumentUseCase;
    this._s3Service = s3Service;
  }

  getUploadSignedUrl = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new CustomError(HttpStatusCodes.UNAUTHORIZED, MESSAGES.UNAUTHORIZED);
      }

      const { fileName, contentType } = req.body;
      if (!fileName || !contentType) {
        throw new CustomError(HttpStatusCodes.BAD_REQUEST, MESSAGES.INVALID_REQUEST_BODY);
      }

      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(contentType)) {
        throw new CustomError(HttpStatusCodes.BAD_REQUEST, "File type not supported. Please upload a PDF or an Image.");
      }

      const result = await this._s3Service.getUploadSignedUrl(
        fileName,
        contentType,
        "patient_documents"
      );

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Upload signed URL generated successfully.",
        result,
      );
    } catch (error) {
      next(error);
    }
  };

  createUploadedDocument = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const patientId = req.user?.userId;
      const role = req.user?.role;

      if (!patientId || role !== Roles.USER) {
        throw new CustomError(HttpStatusCodes.UNAUTHORIZED, MESSAGES.UNAUTHORIZED);
      }

      const {
        title,
        category,
        customCategory,
        specializationId,
        customSpecialization,
        fileKey,
        thumbnailKey,
        reportDate,
      } = req.body;

      if (!title || !category || !fileKey || !thumbnailKey || !reportDate) {
        throw new CustomError(HttpStatusCodes.BAD_REQUEST, "Missing required fields.");
      }

      const result = await this._createUploadedDocumentUseCase.execute({
        patientId,
        title,
        category,
        customCategory,
        specializationId: specializationId || undefined,
        customSpecialization: customSpecialization || undefined,
        fileKey,
        thumbnailKey,
        reportDate,
      });

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.CREATED,
        "Document uploaded successfully.",
        result,
      );
    } catch (error) {
      next(error);
    }
  };

  getUploadedDocuments = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const role = req.user?.role;

      if (!userId || !role) {
        throw new CustomError(HttpStatusCodes.UNAUTHORIZED, MESSAGES.UNAUTHORIZED);
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const category = req.query.category as string;
      const specialization = req.query.specialization as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      const sortBy = req.query.sortBy as "reportDate" | "createdAt" | undefined;
      const sortOrder = req.query.sortOrder as "asc" | "desc" | undefined;

      let patientId = userId;

      if (role === Roles.DOCTOR) {
        const queryPatientId = req.query.patientId as string;
        if (!queryPatientId) {
          throw new CustomError(HttpStatusCodes.BAD_REQUEST, "Patient ID is required for doctor access.");
        }
        patientId = queryPatientId;

        // Perform doctor access validation: Must have an active/in-progress consultation with the patient
        const inProgressConsultation = await consultationModel.findOne({
          doctorId: userId,
          patientId: queryPatientId,
          patientJoinedAt: { $ne: null },
          endedAt: null,
        }).lean();

        if (!inProgressConsultation) {
          // Check if consultation exists but patient has not joined yet
          const existingConsultation = await consultationModel.findOne({
            doctorId: userId,
            patientId: queryPatientId,
            endedAt: null,
          }).lean();

          if (existingConsultation && !existingConsultation.patientJoinedAt) {
            throw new CustomError(
              HttpStatusCodes.FORBIDDEN,
              "Access to patient documents is restricted until the patient has joined the consultation."
            );
          }

          throw new CustomError(
            HttpStatusCodes.FORBIDDEN,
            "Access to patient documents is only allowed when consultation is in progress."
          );
        }
      }

      const result = await this._getUploadedDocumentsUseCase.execute(patientId, page, limit, {
        search,
        category,
        specialization,
        startDate,
        endDate,
        sortBy,
        sortOrder,
      });

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Documents retrieved successfully.",
        result,
      );
    } catch (error) {
      next(error);
    }
  };

  getUploadedDocumentById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const role = req.user?.role;

      if (!userId || !role) {
        throw new CustomError(HttpStatusCodes.UNAUTHORIZED, MESSAGES.UNAUTHORIZED);
      }

      const { id } = req.params;
      if (!id) {
        throw new CustomError(HttpStatusCodes.BAD_REQUEST, "Document ID is required.");
      }

      const result = await this._getUploadedDocumentUseCase.execute(id, userId, role);

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Document details retrieved successfully.",
        result,
      );
    } catch (error) {
      next(error);
    }
  };

  updateUploadedDocument = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const patientId = req.user?.userId;
      const role = req.user?.role;

      if (!patientId || role !== Roles.USER) {
        throw new CustomError(HttpStatusCodes.UNAUTHORIZED, MESSAGES.UNAUTHORIZED);
      }

      const { id } = req.params;
      const { title, category, customCategory, specializationId, customSpecialization, reportDate } = req.body;

      if (!id) {
        throw new CustomError(HttpStatusCodes.BAD_REQUEST, "Document ID is required.");
      }

      const result = await this._updateUploadedDocumentUseCase.execute(id, patientId, {
        title,
        category,
        customCategory,
        specializationId: specializationId === null ? null : (specializationId || undefined),
        customSpecialization: customSpecialization === null ? null : (customSpecialization || undefined),
        reportDate,
      });

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Document details updated successfully.",
        result,
      );
    } catch (error) {
      next(error);
    }
  };

  deleteUploadedDocument = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const patientId = req.user?.userId;
      const role = req.user?.role;

      if (!patientId || role !== Roles.USER) {
        throw new CustomError(HttpStatusCodes.UNAUTHORIZED, MESSAGES.UNAUTHORIZED);
      }

      const { id } = req.params;
      if (!id) {
        throw new CustomError(HttpStatusCodes.BAD_REQUEST, "Document ID is required.");
      }

      await this._deleteUploadedDocumentUseCase.execute(id, patientId);

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Document deleted successfully.",
      );
    } catch (error) {
      next(error);
    }
  };
}

