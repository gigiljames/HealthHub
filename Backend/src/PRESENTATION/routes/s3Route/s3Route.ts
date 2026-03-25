import { Router } from "express";
import TokenService from "../../../application/services/tokenService";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { Roles } from "../../../domain/enums/roles";
import { injectedS3Controller } from "../../DI/s3";
import { ROUTES } from "../../../domain/constants/routes";
import { AuthRepository } from "../../../infrastructure/repositories/authRepository";

const tokenService = new TokenService();
const authRepository = new AuthRepository();

export class S3Route {
  s3Router: Router;

  constructor() {
    this.s3Router = Router();
    this._setRoutes();
  }

  private _setRoutes() {
    this.s3Router.post(
      ROUTES.S3.GET_DOCTOR_MEDICAL_LICENSE_UPLOAD_SIGNED_URL,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) =>
        injectedS3Controller.getDoctorMedicalLicenseUploadSignedUrl(
          req,
          res,
          next,
        ),
    );

    this.s3Router.post(
      ROUTES.S3.GET_DOCTOR_DEGREE_CERTIFICATE_UPLOAD_SIGNED_URL,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) =>
        injectedS3Controller.getDoctorDegreeCertificateUploadSignedUrl(
          req,
          res,
          next,
        ),
    );
  }
}
