import { Router } from "express";
import TokenService from "../../../application/services/tokenService";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { Roles } from "../../../domain/enums/roles";
import { injectedS3Controller } from "../../DI/s3";
import { ROUTES } from "../../../domain/constants/routes";

const tokenService = new TokenService();

export class S3Route {
  s3Router: Router;

  constructor() {
    this.s3Router = Router();
    this._setRoutes();
  }

  private _setRoutes() {
    this.s3Router.post(
      ROUTES.S3.GET_DP_UPLOAD_SIGNED_URL,
      authMiddleware(
        [Roles.HOSPITAL, Roles.ADMIN, Roles.DOCTOR, Roles.USER],
        tokenService
      ),
      (req, res, next) =>
        injectedS3Controller.getDpUploadSignedUrl(req, res, next)
    );
  }
}
