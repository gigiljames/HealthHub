import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { env } from "../config/envConfig";

const { combine, timestamp, printf, errors } = format;

const logFormat = printf(
  ({ level, message, timestamp, stack }) =>
    `${timestamp} [${level.toUpperCase()}] : ${stack || message}`,
);

function createRotateTransport(filename: string, level?: string) {
  return new DailyRotateFile({
    filename: `logs/${filename}-%DATE%.log`,
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxFiles: "7d",
    level,
  });
}

export const devLogger = createLogger({
  level: "debug",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    logFormat,
  ),
  transports: [
    new transports.Console({
      format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        errors({ stack: true }),
        logFormat,
      ),
    }),
    createRotateTransport("error", "error"),
    createRotateTransport("combined"),
  ],
});

export const productionLogger = createLogger({
  level: "http",
  format: combine(
    timestamp(),
    errors({ stack: true }),
    logFormat,
    format.json(),
  ),
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      filename: "logs/error-%DATE%.json", // creates json file
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxFiles: "7d",
      level: "error",
    }),

    new DailyRotateFile({
      filename: "logs/combined-%DATE%.json",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxFiles: "7d",
    }),
  ],
});

export const logger =
  env.NODE_ENV === "production" ? productionLogger : devLogger;
