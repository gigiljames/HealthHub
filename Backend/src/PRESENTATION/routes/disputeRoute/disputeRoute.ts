import { Router } from "express";
import { ROUTES } from "../../../domain/constants/routes";
import { authMiddleware } from "../../middlewares/authMiddleware";
import TokenService from "../../../application/services/tokenService";
import { AuthRepository } from "../../../infrastructure/repositories/authRepository";
import { Roles } from "../../../domain/enums/roles";
import { injectedDisputeController } from "../../DI/dispute";

const tokenService = new TokenService();
const authRepository = new AuthRepository();

export class DisputeRoute {
  disputeRouter: Router;

  constructor() {
    this.disputeRouter = Router();
    this._setRoutes();
  }

  private _setRoutes() {
    // Submit dispute (Patient & Doctor)
    this.disputeRouter.post(
      ROUTES.DISPUTES.SUBMIT,
      authMiddleware([Roles.USER, Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) =>
        injectedDisputeController.submitDispute(req, res, next),
    );

    // Get dispute by appointment (Patient & Doctor)
    this.disputeRouter.get(
      ROUTES.DISPUTES.GET_BY_APPOINTMENT,
      authMiddleware([Roles.USER, Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) =>
        injectedDisputeController.getAppointmentDispute(req, res, next),
    );

    // Get pre-signed URL for uploading evidence (Patient & Doctor)
    this.disputeRouter.post(
      ROUTES.S3.GET_DISPUTE_EVIDENCE_UPLOAD_SIGNED_URL,
      authMiddleware([Roles.USER, Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) =>
        injectedDisputeController.getDisputeEvidenceUploadSignedUrl(
          req,
          res,
          next,
        ),
    );

    // Admin List Disputes
    this.disputeRouter.get(
      ROUTES.DISPUTES.ADMIN_LIST,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) =>
        injectedDisputeController.getAdminDisputes(req, res, next),
    );

    // Admin Get file access URL
    this.disputeRouter.get(
      ROUTES.DISPUTES.ADMIN_FILE_ACCESS_URL,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) =>
        injectedDisputeController.getAdminFileAccessUrl(req, res, next),
    );

    // Admin Get Dispute details
    this.disputeRouter.get(
      ROUTES.DISPUTES.ADMIN_DETAILS,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) =>
        injectedDisputeController.getDisputeDetails(req, res, next),
    );

    // Admin Update Dispute status
    this.disputeRouter.patch(
      ROUTES.DISPUTES.ADMIN_UPDATE_STATUS,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) =>
        injectedDisputeController.updateDisputeStatus(req, res, next),
    );

    // Admin Enforce Moderation
    this.disputeRouter.post(
      ROUTES.DISPUTES.ADMIN_MODERATION,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) =>
        injectedDisputeController.enforceModeration(req, res, next),
    );
  }
}
