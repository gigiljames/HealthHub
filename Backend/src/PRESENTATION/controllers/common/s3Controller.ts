import { NextFunction, Request, Response } from "express";
import { logger } from "../../../utils/logger";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { IGetDpUploadSignedUrlUsecase } from "../../../domain/interfaces/usecases/s3/IGetDpUploadSignedUrlUsecase";
// import { IGetAccessSignedUrlUsecase } from "../../../domain/interfaces/usecases/s3/IGetAccessSignedUrlUsecase";

export class S3Controller {
  constructor(
    private _getDpUploadSignedUrlUsecase: IGetDpUploadSignedUrlUsecase // private _getAccessSignedUrlUsecase: IGetAccessSignedUrlUsecase
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
