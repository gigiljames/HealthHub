import { NextFunction, Request, Response } from "express";
import { logger } from "../../../utils/logger";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { IDGetMedicalLicenseUploadSignedUrlUsecase } from "../../../domain/interfaces/usecases/doctor/doctorProfile/IDGetMedicalLicenseUploadSignedUrlUsecase";
import { IDGetDegreeCertificateUploadSignedUrlUsecase } from "../../../domain/interfaces/usecases/doctor/doctorProfile/IDGetDegreeCertificateUploadSignedUrlUsecase";
import { MESSAGES } from "../../../domain/constants/messages";
import { CustomError } from "../../../domain/entities/customError";
import { HTTPResponseBuilder } from "../../../utils/httpResponseBuilder";

export class S3Controller {
  constructor(
    private readonly _getDoctorMedicalLicenseUploadSignedUrlUsecase: IDGetMedicalLicenseUploadSignedUrlUsecase,
    private readonly _getDoctorDegreeCertificateUploadSignedUrlUsecase: IDGetDegreeCertificateUploadSignedUrlUsecase,
  ) {}

  async getDoctorMedicalLicenseUploadSignedUrl(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (!req.user) {
        return HTTPResponseBuilder.buildErrorResponse(
          req,
          res,
          HttpStatusCodes.UNAUTHORIZED,
          MESSAGES.UNAUTHORIZED,
        );
      }

      const doctorId = req.user.userId;

      if (!doctorId) {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }

      const { fileName, contentType } = req.body;

      const result =
        await this._getDoctorMedicalLicenseUploadSignedUrlUsecase.execute(
          doctorId,
          fileName,
          contentType,
        );

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Medical license upload signed URL fetched successfully",
        result,
      );
    } catch (error) {
      logger.error(
        "ERROR: S3 controller - getDoctorMedicalLicenseUploadSignedUrl",
      );
      next(error);
    }
  }

  async getDoctorDegreeCertificateUploadSignedUrl(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (!req.user) {
        return HTTPResponseBuilder.buildErrorResponse(
          req,
          res,
          HttpStatusCodes.UNAUTHORIZED,
          MESSAGES.UNAUTHORIZED,
        );
      }

      const doctorId = req.user.userId;
      const { fileName, contentType } = req.body;

      const result =
        await this._getDoctorDegreeCertificateUploadSignedUrlUsecase.execute(
          doctorId,
          fileName,
          contentType,
        );

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Degree certificate upload signed URL fetched successfully",
        result,
      );
    } catch (error) {
      logger.error(
        "ERROR: S3 controller - getDoctorDegreeCertificateUploadSignedUrl",
      );
      next(error);
    }
  }
}

