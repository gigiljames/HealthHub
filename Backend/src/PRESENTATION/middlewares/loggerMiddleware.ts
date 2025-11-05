import { NextFunction, Request, Response } from "express";
import morgan, { StreamOptions } from "morgan";
import { devLogger, productionLogger } from "../../utils/logger";

export function loggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const stream: StreamOptions = {
    write: (message) =>
      (process.env.NODE_ENV === "development"
        ? devLogger
        : productionLogger
      ).http(message.trim()),
  };
  let morganLogger = morgan("combined", { stream });
  if (process.env.NODE_ENV === "development") {
    morganLogger = morgan("short", { stream });
  }
  morganLogger(req, res, next);
}
