import { NextFunction, Request, Response } from "express";
import morgan, { StreamOptions } from "morgan";
import { devLogger, productionLogger } from "../../utils/logger";
import { env } from "../../config/envConfig";

export function loggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const stream: StreamOptions = {
    write: (message) =>
      (env.NODE_ENV === "development" ? devLogger : productionLogger).http(
        message.trim(),
      ),
  };
  let morganLogger = morgan("combined", { stream });
  if (env.NODE_ENV === "development") {
    morganLogger = morgan("short", { stream });
  }
  morganLogger(req, res, next);
}
