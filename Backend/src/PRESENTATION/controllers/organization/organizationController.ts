import { NextFunction, Request, Response } from "express";
import { logger } from "../../../utils/logger";
import { IListOrganizationUsecase } from "../../../domain/interfaces/usecases/organization/IListOrganizationUsecase";
import { IEnrolOrganizationUsecase } from "../../../domain/interfaces/usecases/organization/IEnrolOrganizationUsecase";
import { IConfirmEnrolmentUsecase } from "../../../domain/interfaces/usecases/organization/IConfirmEnrolmentUsecase";
import { ISendStatusOtpUsecase } from "../../../domain/interfaces/usecases/organization/ISendStatusOtpUsecase";
import { ICheckStatusUsecase } from "../../../domain/interfaces/usecases/organization/ICheckStatusUsecase";
import { IResubmitEnrolmentUsecase } from "../../../domain/interfaces/usecases/organization/IResubmitEnrolmentUsecase";
import { IGetOrganizationByCodeUsecase } from "../../../domain/interfaces/usecases/organization/IGetOrganizationByCodeUsecase";
import { IAdminListOrganizationsUsecase } from "../../../domain/interfaces/usecases/organization/IAdminListOrganizationsUsecase";
import { IGetOrganizationByIdUsecase } from "../../../domain/interfaces/usecases/organization/IGetOrganizationByIdUsecase";
import { IAdminUpdateOrganizationStatusUsecase } from "../../../domain/interfaces/usecases/organization/IAdminUpdateOrganizationStatusUsecase";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";

export class OrganizationController {
  constructor(
    private readonly _listOrganizationUsecase: IListOrganizationUsecase,
    private readonly _enrolOrganizationUsecase: IEnrolOrganizationUsecase,
    private readonly _confirmEnrolmentUsecase: IConfirmEnrolmentUsecase,
    private readonly _sendStatusOtpUsecase: ISendStatusOtpUsecase,
    private readonly _checkStatusUsecase: ICheckStatusUsecase,
    private readonly _resubmitEnrolmentUsecase: IResubmitEnrolmentUsecase,
    private readonly _getOrganizationByCodeUsecase: IGetOrganizationByCodeUsecase,
    private readonly _adminListOrganizationsUsecase: IAdminListOrganizationsUsecase,
    private readonly _getOrganizationByIdUsecase: IGetOrganizationByIdUsecase,
    private readonly _adminUpdateOrganizationStatusUsecase: IAdminUpdateOrganizationStatusUsecase,
  ) { }

  async listOrganizations(req: Request, res: Response, next: NextFunction) {
    try {
      const organizations = await this._listOrganizationUsecase.execute();
      res.status(HttpStatusCodes.OK).json({
        success: true,
        message: MESSAGES.ORGANIZATION.ORGANIZATIONS_FETCHED,
        organizations,
      });
    } catch (error) {
      logger.error("ERROR: Organization controller - listOrganizations");
      next(error);
    }
  }

  async enrolOrganization(req: Request, res: Response, next: NextFunction) {
    try {
      await this._enrolOrganizationUsecase.execute(req.body);
      res.status(HttpStatusCodes.OK).json({
        success: true,
        message: MESSAGES.ORGANIZATION.ENROL_SUCCESS,
      });
    } catch (error) {
      logger.error("ERROR: Organization controller - enrolOrganization");
      next(error);
    }
  }

  async confirmEnrolment(req: Request, res: Response, next: NextFunction) {
    try {
      await this._confirmEnrolmentUsecase.execute(req.body);
      res.status(HttpStatusCodes.CREATED).json({
        success: true,
        message: MESSAGES.ORGANIZATION.CONFIRM_SUCCESS,
      });
    } catch (error) {
      logger.error("ERROR: Organization controller - confirmEnrolment");
      next(error);
    }
  }

  async sendStatusOtp(req: Request, res: Response, next: NextFunction) {
    try {
      await this._sendStatusOtpUsecase.execute(req.body.email);
      res.status(HttpStatusCodes.OK).json({
        success: true,
        message: MESSAGES.ORGANIZATION.STATUS_OTP_SENT,
      });
    } catch (error) {
      logger.error("ERROR: Organization controller - sendStatusOtp");
      next(error);
    }
  }

  async checkStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this._checkStatusUsecase.execute(req.body.email, req.body.otp);
      res.status(HttpStatusCodes.OK).json({
        success: true,
        message: MESSAGES.ORGANIZATION.STATUS_FETCHED,
        organization: result,
      });
    } catch (error) {
      logger.error("ERROR: Organization controller - checkStatus");
      next(error);
    }
  }

  async resubmitEnrolment(req: Request, res: Response, next: NextFunction) {
    try {
      await this._resubmitEnrolmentUsecase.execute(req.body);
      res.status(HttpStatusCodes.OK).json({
        success: true,
        message: MESSAGES.ORGANIZATION.RESUBMIT_SUCCESS,
      });
    } catch (error) {
      logger.error("ERROR: Organization controller - resubmitEnrolment");
      next(error);
    }
  }

  async getOrganizationByCode(req: Request, res: Response, next: NextFunction) {
    try {
      const type = req.query.type as string || undefined;
      const result = await this._getOrganizationByCodeUsecase.execute(req.params.code, type);
      res.status(HttpStatusCodes.OK).json({
        success: true,
        message: MESSAGES.ORGANIZATION.CODE_LOOKUP_SUCCESS,
        organization: result,
      });
    } catch (error) {
      logger.error("ERROR: Organization controller - getOrganizationByCode");
      next(error);
    }
  }

  async adminListOrganizations(req: Request, res: Response, next: NextFunction) {
    try {
      const query = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        search: req.query.search as string || undefined,
        organizationType: req.query.organizationType as string || undefined,
        isBlocked: req.query.isBlocked === "true" ? true : req.query.isBlocked === "false" ? false : undefined,
        verificationStatus: req.query.verificationStatus as any || undefined,
      };

      const result = await this._adminListOrganizationsUsecase.execute(query);
      res.status(HttpStatusCodes.OK).json({
        success: true,
        ...result,
      });
    } catch (error) {
      logger.error("ERROR: Organization controller - adminListOrganizations");
      next(error);
    }
  }

  async adminGetOrganizationById(req: Request, res: Response, next: NextFunction) {
    try {
      const organization = await this._getOrganizationByIdUsecase.execute(req.params.id);
      res.status(HttpStatusCodes.OK).json({
        success: true,
        organization,
      });
    } catch (error) {
      logger.error("ERROR: Organization controller - adminGetOrganizationById");
      next(error);
    }
  }

  async adminUpdateOrganizationStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { action, rejectionReason } = req.body;
      await this._adminUpdateOrganizationStatusUsecase.execute(req.params.id, action, rejectionReason);
      res.status(HttpStatusCodes.OK).json({
        success: true,
        message: MESSAGES.ORGANIZATION.STATUS_UPDATED,
      });
    } catch (error) {
      logger.error("ERROR: Organization controller - adminUpdateOrganizationStatus");
      next(error);
    }
  }
}
