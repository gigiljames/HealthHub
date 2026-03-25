import z from "zod";
import { MESSAGES } from "../../domain/constants/messages";

export const envSchema = z.object({
  PORT: z.coerce
    .number({ message: MESSAGES.ENV.PORT_ERROR })
    .min(3000, { message: MESSAGES.ENV.PORT_ERROR })
    .max(9000, { message: MESSAGES.ENV.PORT_ERROR }),
  NODE_ENV: z.enum(["development", "production", "test"], {
    message: MESSAGES.ENV.NODE_ENV_ERROR,
  }),
  NODEMAILER_USER: z.email({ message: MESSAGES.ENV.NODEMAILER_USER_ERROR }),
  NODEMAILER_PASS: z
    .string({ message: MESSAGES.ENV.NODEMAILER_PASS_ERROR })
    .min(1, {
      message: MESSAGES.ENV.NODEMAILER_PASS_ERROR,
    }),
  FRONTEND_URL: z.url({ message: MESSAGES.ENV.FRONTEND_URL_ERROR }),
  MONGODB_URL: z.url({ message: MESSAGES.ENV.MONGODB_URL_ERROR }),
  OTP_EXPIRY: z.coerce
    .number({
      message: MESSAGES.ENV.OTP_EXPIRY_ERROR,
    })
    .min(1, { message: MESSAGES.ENV.OTP_EXPIRY_ERROR }),
  ACCESS_TOKEN_SECRET: z
    .string({
      message: MESSAGES.ENV.ACCESS_TOKEN_SECRET_ERROR,
    })
    .min(1, {
      message: MESSAGES.ENV.ACCESS_TOKEN_SECRET_ERROR,
    }),
  REFRESH_TOKEN_SECRET: z
    .string({
      message: MESSAGES.ENV.REFRESH_TOKEN_SECRET_ERROR,
    })
    .min(1, {
      message: MESSAGES.ENV.REFRESH_TOKEN_SECRET_ERROR,
    }),
  GOOGLE_AUTH_CLIENT_ID: z
    .string({
      message: MESSAGES.ENV.GOOGLE_AUTH_CLIENT_ID_ERROR,
    })
    .min(1, {
      message: MESSAGES.ENV.GOOGLE_AUTH_CLIENT_ID_ERROR,
    }),
  GOOGLE_AUTH_CLIENT_SECRET: z
    .string({
      message: MESSAGES.ENV.GOOGLE_AUTH_CLIENT_SECRET_ERROR,
    })
    .min(1, {
      message: MESSAGES.ENV.GOOGLE_AUTH_CLIENT_SECRET_ERROR,
    }),
  AWS_REGION: z
    .string({ message: MESSAGES.ENV.AWS_REGION_ERROR })
    .min(1, { message: MESSAGES.ENV.AWS_REGION_ERROR }),
  AWS_ACCESS_KEY_ID: z
    .string({ message: MESSAGES.ENV.AWS_ACCESS_KEY_ID_ERROR })
    .min(1, {
      message: MESSAGES.ENV.AWS_ACCESS_KEY_ID_ERROR,
    }),
  AWS_SECRET_ACCESS_KEY: z
    .string({ message: MESSAGES.ENV.AWS_SECRET_ACCESS_KEY_ERROR })
    .min(1, {
      message: MESSAGES.ENV.AWS_SECRET_ACCESS_KEY_ERROR,
    }),
  AWS_S3_BUCKET_NAME: z
    .string({ message: MESSAGES.ENV.AWS_S3_BUCKET_NAME_ERROR })
    .min(1, { message: MESSAGES.ENV.AWS_S3_BUCKET_NAME_ERROR }),
  AWS_SIGNED_ACCESS_URL_EXPIRY: z.coerce
    .number({
      message: MESSAGES.ENV.AWS_SIGNED_ACCESS_URL_EXPIRY_ERROR,
    })
    .min(1, { message: MESSAGES.ENV.AWS_SIGNED_ACCESS_URL_EXPIRY_ERROR }),
  AWS_SIGNED_UPLOAD_URL_EXPIRY: z.coerce
    .number({
      message: MESSAGES.ENV.AWS_SIGNED_UPLOAD_URL_EXPIRY_ERROR,
    })
    .min(1, { message: MESSAGES.ENV.AWS_SIGNED_UPLOAD_URL_EXPIRY_ERROR }),
  MAX_SLOT_DAYS: z.coerce
    .number({
      message: MESSAGES.ENV.MAX_SLOT_DAYS_ERROR,
    })
    .min(5, { message: MESSAGES.ENV.MAX_SLOT_DAYS_ERROR }),
  STRIPE_SECRET_KEY: z
    .string({
      message: MESSAGES.ENV.STRIPE_SECRET_KEY_ERROR,
    })
    .min(1, { message: MESSAGES.ENV.STRIPE_SECRET_KEY_ERROR }),
  STRIPE_WEBHOOK_SECRET: z
    .string({
      message: MESSAGES.ENV.STRIPE_WEBHOOK_SECRET_ERROR,
    })
    .min(1, { message: MESSAGES.ENV.STRIPE_WEBHOOK_SECRET_ERROR }),
  SLOT_LOCK_EXPIRY_MS: z.coerce
    .number({
      message: MESSAGES.ENV.SLOT_LOCK_EXPIRY_MS_ERROR,
    })
    .min(1000, { message: MESSAGES.ENV.SLOT_LOCK_EXPIRY_MS_ERROR }),
  PLATFORM_COMMISSION: z.coerce
    .number({
      message: MESSAGES.ENV.PLATFORM_COMMISSION_ERROR,
    })
    .min(0, { message: MESSAGES.ENV.PLATFORM_COMMISSION_ERROR }),
  DOCTOR_PAYOUT_CRON_RULE: z.string({
    message: MESSAGES.ENV.DOCTOR_PAYOUT_CRON_RULE_ERROR,
  }),
  LOCK_SWEEPER_CRON_RULE: z.string({
    message: MESSAGES.ENV.LOCK_SWEEPER_CRON_RULE_ERROR,
  }),
  AUTO_NO_SHOW_CRON_RULE: z.string({
    message: MESSAGES.ENV.AUTO_NO_SHOW_CRON_RULE_ERROR,
  }),
});
