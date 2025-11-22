import { NextFunction, Request, Response } from "express";
import { logger } from "../../../utils/logger";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { IGetDpUploadSignedUrlUsecase } from "../../../domain/interfaces/usecases/s3/IGetDpUploadSignedUrlUsecase";
import { IGetHospitalRegistrationUploadSignedUrlUsecase } from "../../../domain/interfaces/usecases/s3/IGetHospitalRegistrationUploadSignedUrlUsecase";
import { IGetHospitalGstUploadSignedUrlUsecase } from "../../../domain/interfaces/usecases/s3/IGetHospitalGstUploadSignedUrlUsecase";
// import { IGetAccessSignedUrlUsecase } from "../../../domain/interfaces/usecases/s3/IGetAccessSignedUrlUsecase";

export class S3Controller {
  constructor(
    private _getDpUploadSignedUrlUsecase: IGetDpUploadSignedUrlUsecase,
    private _getHospitalRegistrationUploadSignedUrlUsecase: IGetHospitalRegistrationUploadSignedUrlUsecase,
    private _getHospitalGstUploadSignedUrlUsecase: IGetHospitalGstUploadSignedUrlUsecase // private _getAccessSignedUrlUsecase: IGetAccessSignedUrlUsecase
  ) {}

  async getDpUploadSignedUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileName, contentType, folder } = req.body;
      const result = await this._getDpUploadSignedUrlUsecase.execute(
        fileName,
        contentType,
        folder
      );
      res.status(HttpStatusCodes.OK).json({ success: true, ...result });
    } catch (error) {
      logger.error("ERROR: S3 controller - getDpUploadSignedUrl");
      next(error);
    }
  }

  async getHospitalRegistrationUploadSignedUrl(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        return res
          .status(HttpStatusCodes.UNAUTHORIZED)
          .json({ success: false, message: "Unauthorized" });
      }

      const hospitalId = req.user.userId;
      const { fileName, contentType } = req.body;

      const result =
        await this._getHospitalRegistrationUploadSignedUrlUsecase.execute(
          hospitalId,
          fileName,
          contentType
        );

      res.status(HttpStatusCodes.OK).json({ success: true, ...result });
    } catch (error) {
      logger.error(
        "ERROR: S3 controller - getHospitalRegistrationUploadSignedUrl"
      );
      next(error);
    }
  }

  async getHospitalGstUploadSignedUrl(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        return res
          .status(HttpStatusCodes.UNAUTHORIZED)
          .json({ success: false, message: "Unauthorized" });
      }

      const hospitalId = req.user.userId;
      const { fileName, contentType } = req.body;

      const result = await this._getHospitalGstUploadSignedUrlUsecase.execute(
        hospitalId,
        fileName,
        contentType
      );

      res.status(HttpStatusCodes.OK).json({ success: true, ...result });
    } catch (error) {
      logger.error("ERROR: S3 controller - getHospitalGstUploadSignedUrl");
      next(error);
    }
  }

  // async getAccessSignedUrl(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const { key } = req.body;
  //     const accessUrl = await this._getAccessSignedUrlUsecase.execute(key);
  //     res.status(200).json({ success: true, accessUrl });
  //   } catch (error) {
  //     logger.error("ERROR: S3 controller - getAccessSignedUrl");
  //     next(error);
  //   }
  // }
}
