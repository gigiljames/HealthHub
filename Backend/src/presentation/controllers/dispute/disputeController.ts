import { NextFunction, Request, Response } from "express";
import { ISubmitDisputeUseCase } from "../../../domain/interfaces/usecases/disputes/ISubmitDisputeUseCase";
import { IGetAdminDisputesUseCase } from "../../../domain/interfaces/usecases/disputes/IGetAdminDisputesUseCase";
import { IGetDisputeDetailsUseCase } from "../../../domain/interfaces/usecases/disputes/IGetDisputeDetailsUseCase";
import { IUpdateDisputeStatusUseCase } from "../../../domain/interfaces/usecases/disputes/IUpdateDisputeStatusUseCase";
import { IEnforceModerationActionUseCase } from "../../../domain/interfaces/usecases/disputes/IEnforceModerationActionUseCase";
import { IS3Service } from "../../../domain/interfaces/services/IS3Service";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";
import { CustomError } from "../../../domain/entities/customError";
import { IDisputeRepository } from "../../../domain/interfaces/repositories/IDisputeRepository";
import { logger } from "../../../utils/logger";
import { HTTPResponseBuilder } from "../../../utils/httpResponseBuilder";

export class DisputeController {
  constructor(
    private readonly _submitDisputeUseCase: ISubmitDisputeUseCase,
    private readonly _getAdminDisputesUseCase: IGetAdminDisputesUseCase,
    private readonly _getDisputeDetailsUseCase: IGetDisputeDetailsUseCase,
    private readonly _updateDisputeStatusUseCase: IUpdateDisputeStatusUseCase,
    private readonly _enforceModerationActionUseCase: IEnforceModerationActionUseCase,
    private readonly _s3Service: IS3Service,
    private readonly _disputeRepository: IDisputeRepository,
  ) {}

  async getDisputeEvidenceUploadSignedUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileName, contentType } = req.body;
      if (!fileName || !contentType) {
        throw new CustomError(HttpStatusCodes.BAD_REQUEST, "fileName and contentType are required");
      }
      const result = await this._s3Service.getUploadSignedUrl(fileName, contentType, "disputes");
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Evidence upload signed URL fetched successfully",
        result,
      );
    } catch (error) {
      logger.error("ERROR: DisputeController - getDisputeEvidenceUploadSignedUrl", error);
      next(error);
    }
  }

  async submitDispute(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new CustomError(HttpStatusCodes.UNAUTHORIZED, MESSAGES.UNAUTHORIZED);
      }
      const reporterId = req.user.userId;
      const dispute = await this._submitDisputeUseCase.execute(reporterId, req.body);

      const evidenceWithUrls = [];
      for (const ev of dispute.evidence) {
        let signedUrl = "";
        try {
          signedUrl = await this._s3Service.getAccessSignedUrl(ev.key);
        } catch (err) {
          console.error(`Failed to generate signed access URL for key ${ev.key}`, err);
        }
        evidenceWithUrls.push({
          key: ev.key,
          name: ev.name,
          type: ev.type,
          url: signedUrl,
        });
      }

      const mappedDispute = {
        ...dispute,
        evidence: evidenceWithUrls,
      };

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.CREATED,
        MESSAGES.DISPUTE.CREATED,
        mappedDispute,
      );
    } catch (error) {
      logger.error("ERROR: DisputeController - submitDispute", error);
      next(error);
    }
  }

  async getAdminDisputes(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        search,
        reporterRole,
        reportedUserRole,
        status,
        timeRange,
        startDate,
        endDate,
        sort,
        page,
        limit,
      } = req.query;

      const result = await this._getAdminDisputesUseCase.execute({
        search: search as string,
        reporterRole: reporterRole as string,
        reportedUserRole: reportedUserRole as string,
        status: status as string,
        timeRange: timeRange as string,
        startDate: startDate as string,
        endDate: endDate as string,
        sort: sort as string,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Disputes fetched successfully",
        result,
      );
    } catch (error) {
      logger.error("ERROR: DisputeController - getAdminDisputes", error);
      next(error);
    }
  }

  async getDisputeDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const disputeId = req.params.id;
      const result = await this._getDisputeDetailsUseCase.execute(disputeId);
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Dispute details fetched successfully",
        result,
      );
    } catch (error) {
      logger.error("ERROR: DisputeController - getDisputeDetails", error);
      next(error);
    }
  }

  async updateDisputeStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new CustomError(HttpStatusCodes.UNAUTHORIZED, MESSAGES.UNAUTHORIZED);
      }
      const adminId = req.user.userId;
      const disputeId = req.params.id;
      const { status, resolutionMessage } = req.body;

      const result = await this._updateDisputeStatusUseCase.execute(
        disputeId,
        status,
        adminId,
        resolutionMessage,
      );

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        MESSAGES.DISPUTE.STATUS_UPDATED,
        result,
      );
    } catch (error) {
      logger.error("ERROR: DisputeController - updateDisputeStatus", error);
      next(error);
    }
  }

  async enforceModeration(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new CustomError(HttpStatusCodes.UNAUTHORIZED, MESSAGES.UNAUTHORIZED);
      }
      const adminId = req.user.userId;
      const targetUserId = req.params.userId;
      const { actionType, suspensionDays, reason } = req.body;

      await this._enforceModerationActionUseCase.execute({
        targetUserId,
        actionType,
        suspensionDays,
        reason,
        adminId,
      });

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        MESSAGES.DISPUTE.MODERATION_ENFORCED,
      );
    } catch (error) {
      logger.error("ERROR: DisputeController - enforceModeration", error);
      next(error);
    }
  }

  async getAppointmentDispute(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new CustomError(HttpStatusCodes.UNAUTHORIZED, MESSAGES.UNAUTHORIZED);
      }
      const reporterId = req.user.userId;
      const { appointmentId } = req.params;

      const dispute = await this._disputeRepository.findByAppointmentAndReporter(
        appointmentId,
        reporterId,
      );

      let mappedDispute = null;
      if (dispute) {
        const evidenceWithUrls = [];
        for (const ev of dispute.evidence) {
          let signedUrl = "";
          try {
            signedUrl = await this._s3Service.getAccessSignedUrl(ev.key);
          } catch (err) {
            console.error(`Failed to generate signed access URL for key ${ev.key}`, err);
          }
          evidenceWithUrls.push({
            key: ev.key,
            name: ev.name,
            type: ev.type,
            url: signedUrl,
          });
        }
        mappedDispute = {
          id: dispute.id,
          appointmentId: dispute.appointmentId,
          reporterId: dispute.reporterId,
          reportedUserId: dispute.reportedUserId,
          reason: dispute.reason,
          description: dispute.description,
          status: dispute.status,
          evidence: evidenceWithUrls,
          createdAt: dispute.createdAt,
          resolutionMessage: dispute.resolutionMessage,
        };
      }

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Appointment dispute fetched successfully",
        mappedDispute || undefined,
      );
    } catch (error) {
      logger.error("ERROR: DisputeController - getAppointmentDispute", error);
      next(error);
    }
  }

  async getAdminFileAccessUrl(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new CustomError(HttpStatusCodes.UNAUTHORIZED, MESSAGES.UNAUTHORIZED);
      }
      const { key, download } = req.query;
      if (!key) {
        throw new CustomError(HttpStatusCodes.BAD_REQUEST, "key is required");
      }
      const isDownload = download === "true";
      const signedUrl = await this._s3Service.getAccessSignedUrl(key as string, isDownload ? "attachment" : "");
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Admin file access URL fetched successfully",
        { accessUrl: signedUrl },
      );
    } catch (error) {
      logger.error("ERROR: DisputeController - getAdminFileAccessUrl", error);
      next(error);
    }
  }
}

