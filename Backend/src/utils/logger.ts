import { createLogger, format, transports } from "winston";

const { combine, timestamp, printf, errors } = format;

const logFormat = printf(
  ({ level, message, timestamp, stack }) =>
    `${timestamp} [${level.toUpperCase()}] : ${stack || message}`
);

export const devLogger = createLogger({
  level: "debug",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    logFormat
  ),
  transports: [
    new transports.Console({
      format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        // errors({ stack: true }),
        logFormat
      ),
    }),
    new transports.File({ filename: "logs/error.log", level: "error" }),
    new transports.File({ filename: "logs/combined.log" }),
  ],
});

export const productionLogger = createLogger({
  level: "http",
  format: combine(
    timestamp(),
    errors({ stack: true }),
    logFormat,
    format.json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "logs/error.json", level: "error" }),
    new transports.File({ filename: "logs/combined.json" }),
  ],
});

export const logger =
  process.env.NODE_ENV === "production" ? productionLogger : devLogger;
