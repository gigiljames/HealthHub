import { NextFunction, Request, Response } from "express";
import { CustomError } from "../../domain/entities/customError";
import { HttpStatusCodes } from "../../domain/enums/httpStatusCodes";
import { devLogger, productionLogger } from "../../utils/logger";
import { env } from "../../config/envConfig";

export function errorHandlerMiddleware(
  err: Error | CustomError,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  void next;
  const statusCode =
    err instanceof CustomError
      ? err.statusCode
      : HttpStatusCodes.INTERNAL_SERVER_ERROR;
  if (env.NODE_ENV === "production") {
    productionLogger.error(err.message || "Something went wrong.");
  } else {
    devLogger.error(err.message || "Something went wrong.");
    devLogger.error(err.stack);
  }
  res.status(statusCode).json({
    success: false,
    message: err.message || "Something went wrong.",
  });
}
