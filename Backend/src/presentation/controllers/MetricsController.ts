import { Request, Response, NextFunction } from "express";
import { IGetMetricsUseCase } from "../../domain/interfaces/usecases/metrics/IGetMetricsUseCase";
import { CustomError } from "../../domain/entities/customError";
import { HttpStatusCodes } from "../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../domain/constants/messages";
import { logger } from "../../utils/logger";

export class MetricsController {
  constructor(private readonly _getMetricsUseCase: IGetMetricsUseCase) {}

  getMetrics = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const responseDto = await this._getMetricsUseCase.execute();
      res.setHeader("Content-Type", responseDto.contentType);
      res.status(HttpStatusCodes.OK).send(responseDto.metrics);
    } catch (err) {
      logger.error("[Metrics Fetch Error]", err);
      next(new CustomError(HttpStatusCodes.INTERNAL_SERVER_ERROR, MESSAGES.METRICS.FETCH_ERROR));
    }
  };
}
